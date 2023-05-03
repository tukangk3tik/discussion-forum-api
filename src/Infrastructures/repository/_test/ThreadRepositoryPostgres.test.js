const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('UserRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
        id: 'user-8n4IfRl0GfvfDs_QHxQqr', 
        username: 'test-user', 
        password: 'secret', 
        fullname: 'Test User',
    });
  });

  afterAll(async () => {
    await ThreadTableTestHelper.cleanTable();
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
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-321', 
        title: 'SWE Clean Architecture',
        body: 'Lorem ipsum set dolor amet',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqr',
      }));
    });

    it ('should throw error not found thread', async () => {
      // Arrange
      const id = 'xxxx';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById(id))
        .rejects.toThrowError(NotFoundError);
    });

    it ('should get thread by id', async () => {
      // Arrange
      const id = 'thread-321';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const getThread = await threadRepositoryPostgres.getThreadById(id);

      // Assert 
      expect(getThread).toStrictEqual(new AddedThread({
        id: 'thread-321', 
        title: 'SWE Clean Architecture',
        body: 'Lorem ipsum set dolor amet',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqr',
      }));
    });
  });
})