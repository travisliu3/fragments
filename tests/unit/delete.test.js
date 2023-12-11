const request = require('supertest');
const app = require('../../src/app');

describe('DELETE /v1/fragments:id', () => {
  // DELETE /fragments/:id deletes an existing fragment's data.
  test('DELETE /fragments/:id', async () => {
    const resPost = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('This is a fragment')
      .expect(201);
    const arrPost = resPost.body.fragment;
    const res = await request(app)
      .delete(`/v1/fragments/${arrPost.id}`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    await request(app)
      .delete(`/v1/fragments/${arrPost.id}`)
      .auth('user1@email.com', 'password1')
      .expect(404);
  });
});
