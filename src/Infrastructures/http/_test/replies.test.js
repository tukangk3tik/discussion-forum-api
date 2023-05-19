const pool = require('../../database/postgres/pool');
const bcrypt = require('bcrypt');

const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const BcryptPasswordHash = require('../../security/BcryptPasswordHash');

describe('/threads/{id}/comment endpoint', () => {
  const userId = 'user-1234';
  const userId2 = 'user-1235';
  const threadId = 'thread-4321';
  const commentId = 'comment-567';
  let token = '';
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

    // add user 2
    await UsersTableTestHelper.addUser({
      id: userId2, username: 'mirna1',
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

    // add thread
    await ThreadTableTestHelper.addThread({
      id: threadId,
      title: 'SWE Clean Architecture',
      body: 'Lorem ipsum set dolor amet',
      owner: 'user-1234',
    });

    await CommentTableTestHelper.addComment({
      id: commentId,
      content: 'Comment for SWE Clean Architecture lorem',
      thread_id: threadId,
      owner: userId,
    });
  });

  afterEach(async () => {
    await ReplyTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 401 when no authorization', async () => {
      const requestPayload = {
        content: 'Comment Lorem ipsum set dolor amet',
      };

      const server = await createServer(container);
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property',
        async () => {
          const requestPayload = {};

          const server = await createServer(container);
          const response = await server.inject({
            method: 'POST',
            url: `/threads/${threadId}/comments/${commentId}/replies`,
            payload: requestPayload,
            headers: {'Authorization': `Bearer ${token}`},
          });

          const responseJson = JSON.parse(response.payload);
          expect(response.statusCode).toEqual(400);
          expect(responseJson.status).toEqual('fail');
          expect(responseJson.message).toBeDefined();
        });

    it('should response 400 when request payload ' +
        'not meet data type specification', async () => {
      const requestPayload = {
        content: 12313123132,
      };

      const server = await createServer(container);
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {'Authorization': `Bearer ${token}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 201 and persisted reply', async () => {
      const requestPayload = {
        content: 'Reply Lorem ipsum set dolor amet',
      };

      const server = await createServer(container);
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {'Authorization': `Bearer ${token}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.id).toBeDefined();
    });
  });

  describe('when DELETE ' +
      '/threads/{threadId}/comments/{commentId}/replies/{replyId}',
  () => {
    it('should throw authorization error (401) when delete reply', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/reply-12345`,
        headers: {'Authorization': `Bearer token123`},
      });

      expect(response.statusCode).toEqual(401);
    });

    it('should throw error when want delete reply from other user (403)',
        async () => {
          const replyId = 'reply-12345';
          await ReplyTableTestHelper.addReply({
            id: replyId,
            content: 'Reply test',
            comment_id: commentId,
            owner: userId,
          });

          const server = await createServer(container);
          const response = await server.inject({
            method: 'DELETE',
            url: `/threads/${threadId}/comments` +
            `/${commentId}/replies/${replyId}`,
            headers: {'Authorization': `Bearer ${tokenUser2}`},
          });

          const responseJson = JSON.parse(response.payload);
          expect(response.statusCode).toEqual(403);
          expect(responseJson.status).toEqual('fail');
        });

    it('should response 200 and delete reply', async () => {
      const replyId = 'reply-12345';
      await ReplyTableTestHelper.addReply({
        id: replyId,
        content: 'Reply test',
        comment_id: commentId,
        owner: userId,
      });

      const server = await createServer(container);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {'Authorization': `Bearer ${token}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should throw not found error when delete deleted reply', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/reply-12345`,
        headers: {'Authorization': `Bearer ${token}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });
});
