const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

const pool = require('../../database/postgres/pool');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
        id: 'user-8n4IfRl0GfvfDs_QHxQqy', 
        username: 'test-user', 
        password: 'secret', 
        fullname: 'Test User',
    });
    
    await UsersTableTestHelper.addUser({
      id: 'user-123aksdjad123123d', 
      username: 'test-user-reply', 
      password: 'secret', 
      fullname: 'Test User Replies 123',
    });

    await ThreadTableTestHelper.addThread({
        id: 'thread-3212', 
        title: 'SWE Clean Architecture',
        body: 'Lorem ipsum set dolor amet',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
    });

    await CommentTableTestHelper.addComment({
      id: 'comment-8932', 
      content: 'test replies for comment 8932',
      thread_id: 'thread-3212',
      owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
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

  describe('addReply function', () => {

    it('should add new reply correctly', async () => {
      const newReply = {
        content: 'Reply for comment 123',
        commentId: 'comment-8932',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
      };

      const fakeIdGenerator = () => '84234';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      // Assert 
      expect(addedReply).toBeInstanceOf(AddedReply);
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-84234',
        content: 'Reply for comment 123',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
      }));
    });

    it('should persist add new reply', async () => {
      const newReply = {
        content: 'Reply for comment 123',
        commentId: 'comment-8932',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
      };

      const fakeIdGenerator = () => '84234';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(newReply);

      // Assert 
      const addedReply = await ReplyTableTestHelper.getReplyByContent("Reply for comment 123");
      expect(addedReply).toHaveLength(1);
    });
  });

  describe('getReply by Comment Id function', () => {

    it ('should get reply by comment id', async () => {
      // Arrange
      const id = 'comment-8932';
      ReplyTableTestHelper.addReply({
        content: 'Reply for comment 123',
        comment_id: 'comment-8932',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const getReplies = await replyRepositoryPostgres.getReplyByCommentId(id); 

      // Assert 
      expect(getReplies.length).toBeTruthy();
    });
  });

  describe('deleteReply function', () => {
    it('should persist delete reply', async () => {
      // Arrange
      const replyId = 'reply-84234';
      const commentId = 'comment-8932';
      await ReplyTableTestHelper.addReply({
        id: replyId,
        content: 'Reply for comment 123',
        comment_id: commentId,
        owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReply(replyId);

      // Assert 
      const deletedReply = await ReplyTableTestHelper.getReplyById(replyId);
      expect(deletedReply).toHaveLength(1);
      expect(deletedReply[0].deleted_at).toBeTruthy();
    });
    
    it('should get delete reply by comment id ', async () => {
      // Arrange
      const commentId = 'comment-8932';
      const replyId = 'reply-12321';
      await ReplyTableTestHelper.addReply({
        id: replyId,
        content: 'Reply for comment 123',
        comment_id: commentId,
        owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await replyRepositoryPostgres.deleteReply(replyId);

      // Action
      const getReplies = await replyRepositoryPostgres.getReplyByCommentId(commentId);

      // Assert 
      expect(getReplies).toHaveLength(1);
      expect(getReplies[0].deleted_at).toBeTruthy();
    });

    it('should throw error when delete not available reply', async () => {
      const id = 'reply-xxx';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await (expect(replyRepositoryPostgres.deleteReply(id)))
        .rejects
        .toThrowError(NotFoundError);
    });
  });
  
  describe('verifyOwner function', () => {
    it('should throw not found error', async () => {
      const idReply = 'xxx';
      const owner = 'user-8n4IfRl0GfvfDs_QHxQqy';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyOwner(idReply, owner))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw authorization error', async () => {
      await ReplyTableTestHelper.addReply({
        id: 'reply-37973',
        content: 'Test reply',
        comment_id: 'comment-8932',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
      });

      await UsersTableTestHelper.addUser({
        id: 'user-123456', 
        username: 'test-user-comment-123', 
        password: 'secret', 
        fullname: 'Test User Comment',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyOwner('reply-37973', 'user-123456'))
        .rejects
        .toThrowError(AuthorizationError);
    });

    it('should throw authorization error', async () => {
      await ReplyTableTestHelper.addReply({
        id: 'reply-37973',
        content: 'Test reply',
        comment_id: 'comment-8932',
        owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const result = await replyRepositoryPostgres.verifyOwner(
          'reply-37973', 
          'user-8n4IfRl0GfvfDs_QHxQqy'
      );

      expect(result).toEqual(true);
    });
  });
});