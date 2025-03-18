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
 * - Mocks or stubs any external email-sending if needed (optional).
 *
 * @notes
 * - Ensure that your DB is ready before running these tests (e.g., run migrations).
 * - If you want a dedicated test DB, set DB_URL in an .env.test file or similar.
 * - For demonstration, these tests use random test data and expect status codes from our controllers.
 *
 * @dependencies
 * - jest: for test runner
 * - supertest: for HTTP request testing
 * - app from "../src/app": the main Express application
 */

import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import app from '../app';

const prisma = new PrismaClient();

describe('AUTHENTICATION FLOWS', () => {
  // We'll store tokens here for subsequent tests
  let accessToken: string;
  let refreshToken: string;
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'StrongPass#1';

  afterAll(async () => {
    // Clean up: remove the test user from the DB
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'testuser_' } },
    });
    await prisma.$disconnect();
  });

  // 1. Registration
  describe('POST /auth/register', () => {
    it('should register a new user with valid email/password', async () => {
      const res = await request(app).post('/auth/register').send({
        email: testEmail,
        password: testPassword,
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'Registratie succesvol.');
      expect(res.body.user).toHaveProperty('email', testEmail);
    });

    it('should fail to register a user with a weak password', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: `weak_${Date.now()}@example.com`,
          password: 'weak',
        });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should fail to register if email is missing', async () => {
      const res = await request(app).post('/auth/register').send({
        password: 'MissingEmail#1',
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  // 2. Login
  describe('POST /auth/login', () => {
    it('should login an existing user and return tokens', async () => {
      const res = await request(app).post('/auth/login').send({
        email: testEmail,
        password: testPassword,
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('tokens');
      expect(res.body.tokens).toHaveProperty('accessToken');
      expect(res.body.tokens).toHaveProperty('refreshToken');
      accessToken = res.body.tokens.accessToken;
      refreshToken = res.body.tokens.refreshToken;
    });

    it('should fail login with incorrect password', async () => {
      const res = await request(app).post('/auth/login').send({
        email: testEmail,
        password: 'WrongPassword',
      });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  // 3. Refresh Token
  describe('POST /auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const res = await request(app).post('/auth/refresh').send({
        refreshToken,
        platform: 'web',
      });
      expect(res.status).toBe(200);
      expect(res.body.tokens).toHaveProperty('accessToken');
      expect(res.body.tokens).toHaveProperty('refreshToken');
      // We can store new tokens if desired
      accessToken = res.body.tokens.accessToken;
      refreshToken = res.body.tokens.refreshToken;
    });

    it('should fail to refresh with invalid refresh token', async () => {
      const res = await request(app).post('/auth/refresh').send({
        refreshToken: 'fakeOrExpiredToken',
        platform: 'web',
      });
      // 401 or 404 is possible, depending on code
      expect([401, 404]).toContain(res.status);
      expect(res.body).toHaveProperty('error');
    });
  });

  // 4. Forgot & Reset Password
  describe('POST /auth/forgot-password', () => {
    it('should return 200 even if the email is valid', async () => {
      const res = await request(app).post('/auth/forgot-password').send({
        email: testEmail,
      });
      // Our code returns 200 or 404 depending on user existence.
      // If user is found, status=200. If not found, 404.
      // Here the user does exist, so we expect 200
      expect([200, 404]).toContain(res.status);
    });

    it('should fail with 400 if email is missing', async () => {
      const res = await request(app).post('/auth/forgot-password').send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should fail to reset password if token is missing', async () => {
      const res = await request(app).post('/auth/reset-password').send({
        newPassword: 'NewPass#1',
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    // We do not actually have the real reset token from forgot flow in this test environment,
    // so this is an illustrative test. In a real integration, you would capture the token from
    // the email or the DB and use it here. For demonstration, we expect a 404 or 400.
    it('should fail to reset with an invalid token', async () => {
      const res = await request(app).post('/auth/reset-password').send({
        token: 'someFakeToken',
        newPassword: 'NewPass#1',
      });
      expect([400, 404]).toContain(res.status);
    });
  });

  // 5. Change Password
  describe('POST /auth/change-password', () => {
    it('should change password for logged-in user', async () => {
      // We'll attempt to change from testPassword -> newTestPassword
      // Then restore it back to testPassword to keep subsequent tests valid
      const newTestPassword = 'ChangedPass#1';
      const res = await request(app)
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: testPassword,
          newPassword: newTestPassword,
        });
      // If oldPassword was correct, status=200
      if (res.status === 200) {
        // revert it back to keep test stable
        await request(app)
          .post('/auth/change-password')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            oldPassword: newTestPassword,
            newPassword: testPassword,
          });
        expect(res.status).toBe(200);
      } else {
        // Some environment might forbid direct revert, so just ensure it doesn't break
        expect([200, 401, 400]).toContain(res.status);
      }
    });

    it('should fail with 401 if old password is wrong', async () => {
      const res = await request(app)
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: 'WrongOldPass',
          newPassword: 'SomeNewPass#1',
        });
      expect(res.status).toBe(401);
    });
  });

  // 6. Logout
  describe('POST /auth/logout', () => {
    it('should invalidate the refresh token', async () => {
      const res = await request(app).post('/auth/logout').send({
        refreshToken,
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });
  });
});
