const ThreadTableTestHelper =
    require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentTableTestHelper =
    require('../../../../tests/CommentTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError =
    require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-8n4IfRl0GfvfDs_QHxQqy',
      username: 'test-user-comment',
      password: 'secret',
      fullname: 'Test User Comment',
    });

    await ThreadTableTestHelper.addThread({
      id: 'thread-3212',
      title: 'SWE Clean Architecture',
      body: 'Lorem ipsum set dolor amet',
      owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
    });
  });

  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should add new comment correctly', async () => {
      const newComment = {
        content: 'Comment for SWE Clean Architecture lorem',
        threadId: 'thread-3212',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
      };

      const fakeIdGenerator = () => '567';
      const commentRepositoryPostgres =
          new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment =
          await commentRepositoryPostgres.addComment(newComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-567',
        content: 'Comment for SWE Clean Architecture lorem',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
      }));
    });

    it('should persist add new comment', async () => {
      const newComment = {
        content: 'Comment for SWE Clean Architecture lorem',
        threadId: 'thread-3212',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
      };

      const fakeIdGenerator = () => '567';
      const commentRepositoryPostgres =
          new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(newComment);

      // Assert
      const addedComment = await CommentTableTestHelper.getCommentByContent(
          'Comment for SWE Clean Architecture lorem',
      );

      expect(addedComment).toHaveLength(1);
    });

    it('should throw error when verify not available comment', async () => {
      // Arrange
      const id = 'xxxx';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres
          .verifyCommentAvaibility(id))
          .rejects
          .toThrowError(NotFoundError);
    });
  });

  describe('getComment by thread id function', () => {
    it('should get comment by thread id', async () => {
      // Arrange
      const id = 'comment-567';
      await CommentTableTestHelper.addComment({
        id: id,
        content: 'Comment for SWE Clean Architecture lorem',
        thread_id: 'thread-3212',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const getComment =
          await commentRepositoryPostgres.getCommentByThreadId('thread-3212');

      // Assert
      expect(getComment.length).toEqual(1);
      expect(getComment[0].id).toEqual(id);
      expect(getComment[0].content)
          .toEqual('Comment for SWE Clean Architecture lorem');
      expect(getComment[0].username).toEqual('test-user-comment');
      expect(getComment[0].date).toBeDefined();
    });
  });

  describe('deleteComment function', () => {
    it('should persist delete comment', async () => {
      const id = 'comment-568';
      await CommentTableTestHelper.addComment({
        id: id,
        content: 'Comment for SWE Clean Architecture lorem',
        thread_id: 'thread-3212',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const deletedComment = await commentRepositoryPostgres.deleteComment(id);

      // Assert
      expect(deletedComment.id).toStrictEqual(id);
      expect(deletedComment.deleted_at).toBeTruthy();
    });

    it('should get delete comment by thread id ', async () => {
      const id = 'comment-568';
      await CommentTableTestHelper.addComment({
        id: id,
        content: 'Comment for SWE Clean Architecture lorem',
        thread_id: 'thread-3212',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
      });
      await CommentTableTestHelper.deleteComment(id);

      const threadId = 'thread-3212';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const getComment =
          await commentRepositoryPostgres.getCommentByThreadId(threadId);

      // Assert
      expect(getComment.length).toBeTruthy();
      expect(getComment[0].deleted_at).toBeTruthy();
    });

    it('should throw error when delete not available comment', async () => {
      const id = 'comment-xxx';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await (expect(commentRepositoryPostgres.deleteComment(id)))
          .rejects
          .toThrowError(NotFoundError);
    });
  });

  describe('verifyOwner function', () => {
    it('should throw not found error', async () => {
      const idComment = 'xxx';
      const owner = 'user-8n4IfRl0GfvfDs_QHxQqy';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyOwner(idComment, owner))
          .rejects
          .toThrowError(NotFoundError);
    });

    it('should throw authorization error', async () => {
      await CommentTableTestHelper.addComment({
        id: 'comment-1234567',
        content: 'Test comment',
        thread_id: 'thread-3212',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
      });

      await UsersTableTestHelper.addUser({
        id: 'user-123456',
        username: 'test-user-comment-123',
        password: 'secret',
        fullname: 'Test User Comment',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres
          .verifyOwner('comment-1234567', 'user-123456'))
          .rejects
          .toThrowError(AuthorizationError);
    });

    it('should bypass the owner verification', async () => {
      await CommentTableTestHelper.addComment({
        id: 'comment-1234567',
        content: 'Test comment',
        thread_id: 'thread-3212',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const result = await commentRepositoryPostgres.verifyOwner(
          'comment-1234567',
          'user-8n4IfRl0GfvfDs_QHxQqy',
      );

      expect(result).toEqual(true);
    });
  });
});
