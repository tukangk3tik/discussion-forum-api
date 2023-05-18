const ThreadTableTestHelper = require(
    '../../../../tests/ThreadTableTestHelper',
);
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
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
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addThread function', () => {
    it('should add new thread correctly', async () => {
      // Arrange
      const owner = 'user-8n4IfRl0GfvfDs_QHxQqr';
      const newThread = new NewThread({
        title: 'SWE Clean Architecture',
        body: 'Lorem ipsum set dolor amet',
      });
      const fakeIdGenerator = () => '321';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
          pool, fakeIdGenerator,
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(
          newThread, owner,
      );

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-321',
        title: 'SWE Clean Architecture',
        body: 'Lorem ipsum set dolor amet',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqr',
      }));
    });

    it('should persist add new thread', async () => {
      // Arrange
      const owner = 'user-8n4IfRl0GfvfDs_QHxQqr';
      const newThread = new NewThread({
        title: 'SWE Clean Architecture',
        body: 'Lorem ipsum set dolor amet',
      });
      const fakeIdGenerator = () => '321';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
          pool, fakeIdGenerator,
      );

      // Action
      await threadRepositoryPostgres.addThread(newThread, owner);

      // Assert
      const threads = await ThreadTableTestHelper.getThreadByTitle(
          'SWE Clean Architecture',
      );

      expect(threads).toHaveLength(1);
    });

    it('should throw error not found thread', async () => {
      // Arrange
      const id = 'xxxx';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById(id))
          .rejects.toThrowError(NotFoundError);
    });

    it('should get thread by id', async () => {
      // Arrange
      const id = 'thread-321';
      await ThreadTableTestHelper.addThread({
        id: id,
        title: 'SWE Clean Architecture',
        body: 'Lorem ipsum set dolor amet',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqr',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const getThread = await threadRepositoryPostgres.getThreadById(id);

      // Assert
      expect(getThread.date).toBeDefined();
      expect(getThread.id).toEqual('thread-321');
      expect(getThread.title).toEqual('SWE Clean Architecture');
      expect(getThread.body).toEqual('Lorem ipsum set dolor amet');
      expect(getThread.username).toEqual('test-user');
      expect(getThread.comments).toEqual([]);
    });

    it('should throw error when verify not available thread', async () => {
      // Arrange
      const id = 'xxxx';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadAvaibility(id))
          .rejects.toThrowError(NotFoundError);
    });
  });
});

