const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

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

  afterAll(async () => {
    await CommentTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable(); 
    await pool.end();
  });

  describe('addComment function', () => {

    it('should persist add new comment', async () => {
      const newComment = {
        content: 'Comment for SWE Clean Architecture lorem',
        thread_id: 'thread-3212',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
      };

      const fakeIdGenerator = () => '567';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // Assert 
      expect(addedComment).toBeInstanceOf(AddedComment);
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-567',
        content: 'Comment for SWE Clean Architecture lorem',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
      }));
    });

    it ('should get added comment by id', async () => {
      // Arrange
      const id = 'comment-567';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const getComment = await commentRepositoryPostgres.getCommentById(id); 

      // Assert 
      expect(getComment).toStrictEqual(new AddedComment({
        id: 'comment-567',
        content: 'Comment for SWE Clean Architecture lorem',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
      }));
    });

    it ('should throw error when comment not found', async () => {
      // Arrange
      const id = 'comment-xxx';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert 
      await expect(commentRepositoryPostgres.getCommentById(id))
        .rejects.toThrowError(NotFoundError);
    });
  });

  describe('getComment by Thread Id function', () => {
    it ('should get comment by thread id', async () => {
      // Arrange
      const id = 'thread-3212';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const getComment = await commentRepositoryPostgres.getCommentByThreadId(id); 

      // Assert 
      expect(getComment.length).toBeTruthy();
    });
  });

  describe('deleteComment function', () => {
    it('should persist delete comment', async () => {
      const idComment = 'comment-567';      
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const deletedComment = await commentRepositoryPostgres.deleteComment(idComment);

      // Assert 
      expect(deletedComment.id).toStrictEqual(idComment);
      expect(deletedComment.deleted_at).toBeTruthy();
    });

    it('should get delete comment by thread id ', async () => {
      const id = 'thread-3212';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const getComment = await commentRepositoryPostgres.getCommentByThreadId(id);

      // Assert 
      expect(getComment.length).toBeTruthy();
      expect(getComment[0]).toBeDefined();
      expect(getComment[0].content).toEqual("**komentar telah dihapus**");
    });    
  });
});