const pool = require('../../database/postgres/pool');
const bcrypt = require('bcrypt');

const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const BcryptPasswordHash = require('../../../Infrastructures/security/BcryptPasswordHash');

describe('/threads endpoint', () => {
  let token = '';
  let userId = 'user-1234';

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
    await UsersTableTestHelper.deleteUserById(userId);
    await pool.end();
  });

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 401 when no authorization header', async () => {
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
    });
  });

});