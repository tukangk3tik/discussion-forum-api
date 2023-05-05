const pool = require('../../database/postgres/pool');
const bcrypt = require('bcrypt');

const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const BcryptPasswordHash = require('../../../Infrastructures/security/BcryptPasswordHash');

describe('/threads endpoint', () => {
  let token = '';
  let userId = 'user-1234';
  let threadId = '';

  beforeAll(async () => {
    const server = await createServer(container); 
    const bcryptPassword = new BcryptPasswordHash(bcrypt);
    const passwordHash = await bcryptPassword.hash('secret');
    
    await UsersTableTestHelper.addUser({
      id: userId, username: 'john1', 
      password: passwordHash, fullname: 'John S.',
    });

    const response = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'john1',
        password: 'secret',
      },
    });

    const responseJson = JSON.parse(response.payload);
    expect(responseJson.status).toEqual('success');
    expect(responseJson.data.accessToken).toBeDefined();

    token = responseJson.data.accessToken;
  });

  afterAll(async () => {
    await CommentTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 401 when no authorization', async () => {
      const requestPayload = {
        title: 'SWE Clean Architecture',
        body: 'Lorem ipsum set dolor amet',
      };

      const server = await createServer(container);
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {
        title: 'SWE Clean Architecture',
      };

      const server = await createServer(container);
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {'Authorization': `Bearer ${token}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 201 and persisted thread', async () => {
      const requestPayload = {
        title: 'SWE Clean Architecture',
        body: 'Lorem ipsum set dolor amet',
      };

      const server = await createServer(container);
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {'Authorization': `Bearer ${token}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();

      threadId = responseJson.data.addedThread.id;
    });
  });

  describe('when GET /threads/{id}', () => {
    it('should throw error not found thread', async () => { 
      const server = await createServer(container);
      const response = await server.inject({
        method: 'GET',
        url: `/threads/xxx`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toBeDefined();
    });

    it('should detail thread with comment', async () => { 
      CommentTableTestHelper.addComment({
        id: 'comment-567',
        content:'Comment for SWE Clean Architecture lorem',
        thread_id: threadId,
        owner: userId,
      });

      const server = await createServer(container);
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual(threadId);
      expect(responseJson.data.thread.comments.length).toBeTruthy();
      expect(responseJson.data.thread.comments[0].id).toEqual('comment-567');
    });
  });
});