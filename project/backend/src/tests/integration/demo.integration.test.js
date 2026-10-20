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

  it('should include a shared workspace with comments and version history', async () => {
    const { token } = (await startDemo()).body.data;

    const workspaces = await authGet('/api/workspaces', token);
    expect(workspaces.statusCode).toBe(200);
    expect(workspaces.body.data).toHaveLength(1);
    const workspaceId = workspaces.body.data[0].id;

    const wsCollections = await authGet(`/api/workspaces/${workspaceId}/collections`, token);
    expect(wsCollections.body.data).toHaveLength(1);
    const collectionId = wsCollections.body.data[0].id;

    const wsItems = await authGet(`/api/workspaces/${workspaceId}/collections/${collectionId}/items`, token);
    expect(wsItems.statusCode).toBe(200);
    expect(wsItems.body.data).toHaveLength(3);

    const gpt3 = wsItems.body.data.find((item) => item.title.startsWith('Language Models'));
    const comments = await authGet(`/api/comments/items/${gpt3.id}/comments`, token);
    expect(comments.statusCode).toBe(200);
    expect(JSON.stringify(comments.body.data)).toContain('Pasuje idealnie');

    const history = await authGet(`/api/history/items/${gpt3.id}`, token);
    expect(history.statusCode).toBe(200);
    expect(JSON.stringify(history.body.data)).toContain('"version":2');
  });

  it('should keep other metadata and record only real changes when an item is edited', async () => {
    const { token } = (await startDemo()).body.data;
    const ws = (await authGet('/api/workspaces', token)).body.data[0];
    const col = (await authGet(`/api/workspaces/${ws.id}/collections`, token)).body.data[0];
    const items = (await authGet(`/api/workspaces/${ws.id}/collections/${col.id}/items`, token)).body.data;
    const item = items.find((i) => i.title.startsWith('Training language models'));

    // Same payload the edit form sends: only its own fields, empty notes as ''.
    const response = await request(app)
      .put(`/api/items/${item.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: item.title,
        year: item.year,
        itemType: item.itemType,
        collectionId: item.collectionId,
        notes: '',
        metadata: { authors: item.metadata.authors, pages: null, isbn: null, doi: null, abstract: 'dwa' },
      });
    expect(response.statusCode).toBe(200);

    const updated = (await authGet(`/api/items/${item.id}`, token)).body.data;
    expect(updated.metadata.abstract).toBe('dwa');
    expect(updated.metadata.url).toBe('https://arxiv.org/abs/2203.02155');
    expect(updated.metadata.booktitle).toContain('NeurIPS 2022');
    expect(updated.metadata.authors).toHaveLength(4);
    expect(updated.notes).toBeNull();

    const history = (await authGet(`/api/history/items/${item.id}`, token)).body.data;
    const versions = Array.isArray(history) ? history : history.history || history.versions || [];
    const latest = versions.reduce((a, b) => (a.version > b.version ? a : b));
    expect(Object.keys(latest.diff)).toEqual(['metadata']);
  });

  it('should move a private item into a workspace collection and between workspace collections', async () => {
    const { token } = (await startDemo()).body.data;
    const put = (path, body) => request(app).put(path).set('Authorization', `Bearer ${token}`).send(body);
    const ws = (await authGet('/api/workspaces', token)).body.data[0];
    const [wsCollection] = (await authGet(`/api/workspaces/${ws.id}/collections`, token)).body.data;
    const privateItem = (await authGet('/api/items', token)).body.data[0];

    expect((await put(`/api/items/${privateItem.id}`, { collectionId: wsCollection.id })).statusCode).toBe(200);

    const wsItems = (await authGet(`/api/workspaces/${ws.id}/collections/${wsCollection.id}/items`, token)).body.data;
    expect(wsItems.map((i) => i.id)).toContain(privateItem.id);
    expect((await authGet('/api/items', token)).body.data).toHaveLength(7);
    expect(JSON.stringify((await authGet(`/api/history/items/${privateItem.id}`, token)).body.data)).toContain('moved');

    const second = await request(app)
      .post(`/api/workspaces/${ws.id}/collections`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Do recenzji' });
    expect((await put(`/api/items/${privateItem.id}`, { collectionId: second.body.data.id })).statusCode).toBe(200);
  });

  it('should export the demo authors by name to BibTeX', async () => {
    const { token } = (await startDemo()).body.data;
    const collections = (await authGet('/api/collections', token)).body.data;
    const testing = collections.find((c) => c.name === 'Testowanie');

    const response = await authGet(`/api/export/collections/${testing.id}?format=bibtex`, token);
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('Cem Kaner and James Bach and Bret Pettichord');
    expect(response.text).not.toContain('undefined');
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
    // The made-up colleague goes together with the visitor.
    expect(await User.count({ where: { email: old.email.replace('@', '.anna@') } })).toBe(0);
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
