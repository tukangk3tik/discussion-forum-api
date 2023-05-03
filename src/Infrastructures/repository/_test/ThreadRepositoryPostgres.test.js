const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('UserRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
        id: 'user-8n4IfRl0GfvfDs_QHxQqr', 
        username: 'test-user', 
        password: 'secret', 
        fullname: 'Test User',
    });
  });

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.deleteUserById('user-8n4IfRl0GfvfDs_QHxQqr');
    await pool.end();
  });

  describe('addThread function', () => {
    it ('should persist add new thread', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'SWE Clean Architecture',
        body: 'Lorem ipsum set dolor amet',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqr',
      });
      const fakeIdGenerator = () => '321';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert 
      expect(addedThread).toStrictEqual(new NewThread({
        id: 'thread-321', 
        title: 'SWE Clean Architecture',
        body: 'Lorem ipsum set dolor amet',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqr',
      }));
    });
  });
})