/**
 * @description
 * Integration tests for Admin-only flows: listing users, creating users, updating roles, etc.
 *
 * Key features:
 * - Uses a temporary admin user to authenticate requests
 * - Ensures non-admin requests get 403 Forbidden
 * - Illustrates creating, updating, and deleting user data via the Admin controller
 *
 * @dependencies
 * - jest for the test runner
 * - supertest for HTTP request testing
 * - app from '../src/app' for the Express application
 * - PrismaClient to manipulate DB test data
 *
 * @notes
 * - In a production environment, you might want a separate test DB or seeding logic
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../app';

const prisma = new PrismaClient();

describe('ADMIN FLOWS', () => {
  let adminAccessToken: string;
  let normalUserId: string;

  // Hardcode an admin user email for the tests
  const adminEmail = `admin_tester_${Date.now()}@example.com`;
  const adminPassword = 'AdminPass#1';

  beforeAll(async () => {
    // 1. Create a user in DB with role = ADMIN
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    // 2. Log in as admin to get access token
    const loginRes = await request(app).post('/auth/login').send({
      email: adminEmail,
      password: adminPassword,
    });

    if (loginRes.status === 200) {
      adminAccessToken = loginRes.body.tokens.accessToken;
    }
  });

  afterAll(async () => {
    // Remove admin user, if created
    await prisma.user.deleteMany({
      where: {
        email: adminEmail,
      },
    });

    // Also remove any test user created by the admin route
    if (normalUserId) {
      await prisma.user.deleteMany({
        where: {
          id: normalUserId,
        },
      });
    }

    await prisma.$disconnect();
  });

  describe('ADMIN Access Verification', () => {
    it('should fail if we do not provide an admin token', async () => {
      const res = await request(app).get('/admin/users');
      expect(res.status).toBe(401); // Because we are not logged in at all
    });

    it('should fail if we provide a normal user token (non-admin)', async () => {
      // We create a normal user first
      const normalUserEmail = `normal_user_${Date.now()}@example.com`;
      await request(app).post('/auth/register').send({
        email: normalUserEmail,
        password: 'NormalPass#1',
      });
      // Log in to get the normal user's token
      const normalLoginRes = await request(app).post('/auth/login').send({
        email: normalUserEmail,
        password: 'NormalPass#1',
      });
      const normalAccessToken = normalLoginRes.body?.tokens?.accessToken || '';

      // Try to list users with a normal token
      const adminRes = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${normalAccessToken}`);
      expect(adminRes.status).toBe(403); // Forbidden
    });
  });

  describe('CRUD operations on /admin/users', () => {
    it('should list users when admin token is provided', async () => {
      const res = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminAccessToken}`);
      expect(res.status).toBe(200);
      // Should have an array of users
      expect(Array.isArray(res.body.users)).toBe(true);
    });

    it('should create a new user with specified role', async () => {
      const res = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          email: `test_admin_create_${Date.now()}@example.com`,
          password: 'UserPass#1',
          role: 'USER',
        });
      expect(res.status).toBe(201);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('email');
      normalUserId = res.body.user.id; // store for cleanup
    });

    it('should update an existing user (e.g. change role)', async () => {
      const newRole = 'ADMIN'; // promote to admin
      const res = await request(app)
        .put(`/admin/users/${normalUserId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          role: newRole,
        });
      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe(newRole);
    });

    it('should delete an existing user', async () => {
      const deleteRes = await request(app)
        .delete(`/admin/users/${normalUserId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`);
      expect(deleteRes.status).toBe(200);
    });
  });
});
