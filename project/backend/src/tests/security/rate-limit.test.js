const request = require('supertest');

// Low limits so blocking kicks in within a few requests (must be set before app loads).
process.env.AUTH_RATE_LIMIT_MAX = '5';
process.env.GLOBAL_RATE_LIMIT_MAX = '50';

const app = require('../../app');

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});



describe('Rate Limiting Security Tests', () => {

  describe('Auth Rate Limit (Brute Force)', () => {

    test('powinien zablokować po wielu próbach logowania', async () => {
      const results = [];

      const uniqueEmail = `brute_${Date.now()}@test.com`;

      for (let i = 0; i < 10; i++) {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: uniqueEmail,
            password: 'wrongpassword'
          });
        
        results.push(res.status);
      }

      const blocked = results.filter(status => status === 429);

      console.log(`Zablokowane: ${blocked.length} / ${results.length}`);
      console.log(`Statusy: ${results.join(', ')}`);

      expect(blocked.length).toBeGreaterThan(0);
    });

    test('powinien zwrócić status 429 i komunikat błędu', async () => {
      const uniqueEmail = `brute2_${Date.now()}@test.com`;

      let blockedResponse = null;
      
      for (let i = 0; i < 10; i++) {
        const res = await request(app)
          .post('/api/auth/login')
          .send({ email: uniqueEmail, password: 'wrong' });
        
        if (res.status === 429) {
          blockedResponse = res;
          break;
        }
      }

      expect(blockedResponse).not.toBeNull();
      expect(blockedResponse.status).toBe(429);
      expect(blockedResponse.body.success).toBe(false);
      expect(blockedResponse.body.message).toMatch(/zbyt wiele/i);
    });
  });

  describe('Global Rate Limit', () => {

    test('powinien zablokować po wielu requestach', async () => {
      const results = [];

      for (let i = 0; i < 110; i++) {
        const res = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer invalid_token');
        
        results.push(res.status);
      }

      const blocked = results.filter(status => status === 429);
      
      console.log(`Zablokowane: ${blocked.length} / ${results.length}`);

      expect(blocked.length).toBeGreaterThan(0);
    });
  });
});