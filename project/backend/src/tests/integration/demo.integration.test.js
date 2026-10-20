const request = require('supertest');
const app = require('../../app');
const { User, Item, sequelize } = require('../../models');
const { VISITOR_DEMO_DOMAIN, VISITOR_DEMO_TTL_MS } = require('../../features/auth/demo/demo-accounts');

const startDemo = () => request(app).post('/api/auth/demo');
const authGet = (path, token) => request(app).get(path).set('Authorization', `Bearer ${token}`);

describe('DEMO INTEGRATION: per-visitor demo accounts (POST /auth/demo)', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a logged-in temporary account with the sample library', async () => {
    const response = await startDemo();

    expect(response.statusCode).toBe(201);
    const { token, username, email } = response.body.data;
    expect(token).toBeDefined();
    expect(username).toMatch(/^demo-[0-9a-f]{6}$/);
    expect(email.endsWith(`@${VISITOR_DEMO_DOMAIN}`)).toBe(true);

    const items = await authGet('/api/items', token);
    expect(items.statusCode).toBe(200);
    expect(items.body.data).toHaveLength(8);

    const collections = await authGet('/api/collections', token);
    expect(collections.body.data).toHaveLength(5);
  });

  it('should give each visitor separate data', async () => {
    const first = (await startDemo()).body.data;
    const second = (await startDemo()).body.data;
    expect(first.userId).not.toBe(second.userId);

    // A visitor empties their library...
    await Item.destroy({ where: { userId: first.userId } });

    // ...and the other visitor still sees the full one.
    expect((await authGet('/api/items', first.token)).body.data).toHaveLength(0);
    expect((await authGet('/api/items', second.token)).body.data).toHaveLength(8);
  });

  it('should delete visitor demo accounts older than the TTL when a new demo starts', async () => {
    const old = (await startDemo()).body.data;
    const expiredAt = new Date(Date.now() - VISITOR_DEMO_TTL_MS - 60 * 1000);
    // Backdate through the model (createdAt is normally read-only), so the date is stored in the
    // same format Sequelize compares with.
    const oldUser = await User.findByPk(old.userId);
    oldUser.set('createdAt', expiredAt, { raw: true });
    oldUser.changed('createdAt', true);
    await oldUser.save({ silent: true, fields: ['createdAt'] });

    await startDemo();

    expect(await User.findByPk(old.userId)).toBeNull();
    expect(await Item.count({ where: { userId: old.userId } })).toBe(0);
  });

  it('should not let a demo visitor change the password', async () => {
    const { token } = (await startDemo()).body.data;

    const response = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'anything', newPassword: 'whatever123' });

    expect(response.statusCode).toBe(403);
  });
});
