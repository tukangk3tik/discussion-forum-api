const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

const pool = require('../../database/postgres/pool');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

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

  afterAll(async () => {
    await ReplyTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable(); 
    await pool.end();
  });

  describe('addReply function', () => {

    it('should persist add new reply', async () => {
      const newReply = {
        content: 'Reply for comment 123',
        comment_id: 'comment-8932',
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
  });

  describe('getReply by Comment Id function', () => {
    it ('should get reply by comment id', async () => {
      // Arrange
      const id = 'comment-8932';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const getReplies = await replyRepositoryPostgres.getReplyByCommentId(id); 

      // Assert 
      expect(getReplies.length).toBeTruthy();
    });
  });

  describe('deleteReply function', () => {
    it('should persist delete reply', async () => {
      const idReply = 'reply-84234';      
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const deletedReply = await replyRepositoryPostgres.deleteReply(idReply);

      // Assert 
      expect(deletedReply.id).toStrictEqual(idReply);
      expect(deletedReply.deleted_at).toBeTruthy();
    });
    
    it('should get delete reply by comment id ', async () => {
      // Arrange
      const id = 'comment-8932';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const getReplies = await replyRepositoryPostgres.getReplyByCommentId(id);

      // Assert 
      expect(getReplies.length).toBeTruthy();
      expect(getReplies[0].content).toEqual("**balasan telah dihapus**");
    });    
  });
});