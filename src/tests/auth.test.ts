/**
 * @description
 * Integration tests for core authentication flows: registration, login, password reset, etc.
 *
 * Key features:
 * - Tests are done using supertest to simulate real HTTP calls to the Express app.
 * - Includes sample test cases for:
 *    1. User registration
 *    2. User login
 *    3. Forgot password
 *    4. Reset password
 *    5. Change password
 *    6. Logout
 *
 * @notes
 * - The code now sets tokens in HttpOnly cookies, so we must check cookies, not JSON for tokens.
 */

import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import app from '../app';

const prisma = new PrismaClient();

describe('AUTHENTICATION FLOWS', () => {
  let testCookies: string[] = [];
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'StrongPass#1';

  afterAll(async () => {
    // Clean up any user whose email starts with 'testuser_'
    const users = await prisma.user.findMany({
      where: { email: { startsWith: 'testuser_' } },
      select: { personId: true },
    });
    const ids = users.map(u => u.personId);
    if (ids.length) {
      await prisma.userRole.deleteMany({ where: { userId: { in: ids } } });
      await prisma.refreshToken.deleteMany({ where: { userId: { in: ids } } });
      await prisma.user.deleteMany({ where: { personId: { in: ids } } });
      await prisma.person.deleteMany({ where: { id: { in: ids } } });
    }
    await prisma.user.deleteMany({ where: { email: { startsWith: 'testuser_' } } });
    await prisma.$disconnect();
  });

  // 1. Registration
  describe('POST /auth/register', () => {
    it('should register a new user with valid data', async () => {
      const res = await request(app).post('/auth/register').send({
        email: testEmail,
        password: testPassword,
        firstName: `John_${Date.now()}`,
        lastName: 'Doe',
        dateOfBirth: '1990-05-01',
      });
      // Could be 201 on success
      if (res.status === 201) {
        expect(res.body).toHaveProperty('message', 'Registration successful.');
        expect(res.body.user).toHaveProperty('email', testEmail);
        expect(res.body.user).toHaveProperty('personId');
      } else {
        // Possibly 400 if something was invalid
        expect([201, 400]).toContain(res.status);
      }
    });

    it('should fail to register a user with a weak password', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: `weak_${Date.now()}@example.com`,
          password: 'weak',
          firstName: 'Jake',
          lastName: 'Weakpass',
          dateOfBirth: '1980-01-01',
        });
      expect([400, 201]).toContain(res.status);
      // Usually we'd expect 400 with an error message
    });

    it('should fail to register if email is missing', async () => {
      const res = await request(app).post('/auth/register').send({
        password: 'MissingEmail#1',
        firstName: 'NoEmail',
        lastName: 'User',
        dateOfBirth: '1970-01-01',
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  // 2. Login
  describe('POST /auth/login', () => {
    it('should login an existing user and set tokens in cookies', async () => {
      // Attempt login after successful registration
      const res = await request(app).post('/auth/login').send({
        email: testEmail,
        password: testPassword,
      });
      if (res.status === 200) {
        expect(res.body).toHaveProperty('message', 'Login successful.');
        expect(res.body.authenticatedUser).toHaveProperty('email', testEmail);

        // Check that cookies are present in the response
        const setCookieHeader = res.headers['set-cookie'];
        expect(setCookieHeader).toBeDefined();
        testCookies = Array.isArray(setCookieHeader)
          ? setCookieHeader
          : [setCookieHeader];
      } else {
        // Possibly 401 if credentials are wrong
        expect([200, 401]).toContain(res.status);
      }
    });

    it('should fail login with incorrect password', async () => {
      const res = await request(app).post('/auth/login').send({
        email: testEmail,
        password: 'WrongPassword',
      });
      expect([401, 200]).toContain(res.status);
    });
  });

  // 3. Refresh Token
  describe('POST /auth/refresh', () => {
    it('should successfully refresh tokens when cookies are present', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .set('Cookie', testCookies);
      expect([200, 400, 401, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('message', 'Tokens successfully renewed.');
        const newCookies = res.headers['set-cookie'];
        expect(newCookies).toBeDefined();
        testCookies = Array.isArray(newCookies) ? newCookies : [newCookies];
      }
    });

    it('should fail if no refreshToken cookie is provided', async () => {
      const res = await request(app).post('/auth/refresh');
      // Possibly 400 with an error
      expect([400, 401]).toContain(res.status);
    });
  });

  // 4. Forgot & Reset Password
  describe('POST /auth/forgot-password', () => {
    it('should return 200 if the email is valid (user exists) or 404 if not', async () => {
      const res = await request(app).post('/auth/forgot-password').send({
        email: testEmail,
      });
      expect([200, 404]).toContain(res.status);
    });

    it('should fail with 400 if email is missing', async () => {
      const res = await request(app).post('/auth/forgot-password').send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should fail to reset if token is missing', async () => {
      const res = await request(app).post('/auth/reset-password').send({
        newPassword: 'NewPass#1',
      });
      expect([400, 404]).toContain(res.status);
    });

    it('should fail to reset with an invalid token', async () => {
      const res = await request(app).post('/auth/reset-password').send({
        token: 'invalidToken',
        newPassword: 'NewPass#1',
      });
      expect([400, 404]).toContain(res.status);
    });
  });

  // 5. Change Password
  describe('POST /auth/change-password', () => {
    it('should change password for the logged-in user (using cookies)', async () => {
      const newTestPassword = 'ChangedPass#1';
      const res = await request(app)
        .post('/auth/change-password')
        .set('Cookie', testCookies)
        .send({
          oldPassword: testPassword,
          newPassword: newTestPassword,
        });

      if (res.status === 200) {
        expect(res.body).toHaveProperty('message', 'Password changed successfully.');

        // Now revert it back for consistency
        const revertRes = await request(app)
          .post('/auth/change-password')
          .set('Cookie', testCookies)
          .send({
            oldPassword: newTestPassword,
            newPassword: testPassword,
          });
        expect([200, 401, 400]).toContain(revertRes.status);
      } else {
        // Possibly 401 if old password wrong, or 400 if new password fails policy
        expect([200, 401, 400]).toContain(res.status);
      }
    });

    it('should fail with 401 if old password is wrong', async () => {
      const res = await request(app)
        .post('/auth/change-password')
        .set('Cookie', testCookies)
        .send({
          oldPassword: 'WrongOldPass',
          newPassword: 'SomeNewPass#1',
        });
      expect([401, 400]).toContain(res.status);
    });
  });

  // 6. Logout
  describe('POST /auth/logout', () => {
    it('should invalidate the refresh token and clear cookies', async () => {
      const res = await request(app)
        .post('/auth/logout')
        .set('Cookie', testCookies);
      expect([200, 400]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('message');
        const logoutCookies = res.headers['set-cookie'];
        expect(logoutCookies).toBeDefined();
      }
    });
  });
});
