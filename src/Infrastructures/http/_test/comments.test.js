const pool = require('../../database/postgres/pool');
const bcrypt = require('bcrypt');

const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const BcryptPasswordHash = require('../../security/BcryptPasswordHash');

describe('/threads/{id}/comment endpoint', () => {
  let token = '';
  let userId = 'user-1234';
  let threadId = '';
  let commentId = '';
  let tokenUser2 = '';

  beforeAll(async () => {
    const server = await createServer(container); 
    const bcryptPassword = new BcryptPasswordHash(bcrypt);
    const passwordHash = await bcryptPassword.hash('secret');
    
    // add user 1
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

    // add thread
    const requestPayload = {
      title: 'SWE Clean Architecture',
      body: 'Lorem ipsum set dolor amet',
    };

    const responseThread = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: requestPayload,
      headers: {'Authorization': `Bearer ${token}`},
    });

    const responseJsonThread = JSON.parse(responseThread.payload);
    expect(response.statusCode).toEqual(201);
    expect(responseJsonThread.status).toEqual('success');
    expect(responseJsonThread.data.addedThread).toBeDefined();
    expect(responseJsonThread.data.addedThread.id).toBeDefined();

    threadId = responseJsonThread.data.addedThread.id;

    // add user 2
    await UsersTableTestHelper.addUser({
      id: 'user-1235', username: 'mirna1', 
      password: passwordHash, fullname: 'Mirna L.',
    });

    const responseUser2 = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'mirna1',
        password: 'secret',
      },
    });

    const responseJsonUser2 = JSON.parse(responseUser2.payload);
    expect(responseJsonUser2.status).toEqual('success');
    expect(responseJsonUser2.data.accessToken).toBeDefined();

    tokenUser2 = responseJsonUser2.data.accessToken;
  });

  afterAll(async () => {
    await CommentTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads/{id}/comments', () => {
    it('should response 401 when no authorization', async () => {
      const requestPayload = {
        content: 'Comment Lorem ipsum set dolor amet',
      };

      const server = await createServer(container);
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {};

      const server = await createServer(container);
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {'Authorization': `Bearer ${token}`},
      });
      
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 201 and persisted comment', async () => {
      const requestPayload = {
        content: 'Comment Lorem ipsum set dolor amet',
      };

      const server = await createServer(container);
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {'Authorization': `Bearer ${token}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.id).toBeDefined();

      commentId = responseJson.data.addedComment.id;
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {

    it('should throw authorization error (401) when delete comment', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {'Authorization': `Bearer token123`},
      });

      expect(response.statusCode).toEqual(401);
    });

    it('should throw error when want delete comment from other user (403)', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {'Authorization': `Bearer ${tokenUser2}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail')
    });

    it('should response 200 and delete comment', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {'Authorization': `Bearer ${token}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should throw error when delete deleted comment', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {'Authorization': `Bearer ${token}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });
});