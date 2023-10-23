const request = require('supertest');
const MarkdownIt = require('markdown-it');
const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  // GET /fragments/?expand=1 returns expanded fragment metadata for an authenticated user.
  test('GET /fragments/?expand=1', async () => {
    var arrPost = [];
    for (let index = 0; index < 2; index++) {
      const resPost = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('content-type', 'text/plain')
        .send('This is a fragment')
        .expect(201);
      arrPost.push(resPost.body.fragment);
    }

    const res = await request(app)
      .get('/v1/fragments/?expand=1')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragments).toEqual(arrPost);
  });

  // GET /fragments/:id returns an existing fragment's data with the expected Content-Type.
  test('GET /fragments/:id', async () => {
    const resPost = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('This is a fragment')
      .expect(201);
    const arrPost = resPost.body.fragment;
    const res = await request(app)
      .get(`/v1/fragments/${arrPost.id}`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual('This is a fragment');
  });

  // GET /fragments/:id/info returns an existing fragment's metadata.
  test('GET /fragments/:id/info', async () => {
    const resPost = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('This is a fragment')
      .expect(201);
    const arrPost = resPost.body.fragment;
    const res = await request(app)
      .get(`/v1/fragments/${arrPost.id}/info`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.fragment).toEqual(arrPost);
  });

  // GET /fragments/:id.ext returns an existing fragment's data converted to a supported type.
  test('GET /fragments/:id.ext', async () => {
    const resPost = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/markdown')
      .send('This is a fragment')
      .expect(201);
    const arrPost = resPost.body.fragment;
    const res = await request(app)
      .get(`/v1/fragments/${arrPost.id}.html`)
      .auth('user1@email.com', 'password1');
    const md = new MarkdownIt();
    const markdownText = md.render('This is a fragment');
    const html = md.render(markdownText);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(html);
  });
});
