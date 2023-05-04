const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

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
    await UsersTableTestHelper.deleteUserById('user-8n4IfRl0GfvfDs_QHxQqy'); 
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

    //it('should persist add new replies for comment', async () => {
    //  const newReplies = {
    //    content: 'Replies comment for comment 567',
    //    thread_id: 'thread-3212',
    //    replies_parent: 'comment-567',
    //    owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
    //  };

    //  const fakeIdGenerator = () => '8912';
    //  const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

    //  // Action
    //  const addedReplies = await commentRepositoryPostgres.addComment(newReplies);

    //  // Assert 
    //  expect(addedReplies).toStrictEqual({
    //    id: 'comment-8912',
    //    content: 'Replies comment for comment 567',
    //    thread_id: 'thread-3212',
    //    replies_parent: 'comment-567',
    //    owner: 'user-8n4IfRl0GfvfDs_QHxQqy',
    //  });
    //});

    //it('should persist delete replies', async () => {
    //  const idReplies = 'comment-8912';
    //  
    //  const fakeIdGenerator = () => '8912';
    //  const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

    //  // Action
    //  const deletedReplies = await commentRepositoryPostgres.deleteComment(idReplies);

    //  // Assert 
    //  expect(deletedReplies.id).toStrictEqual(idReplies);
    //  expect(deletedReplies.deleted_at).toBeTruthy();
    //});

    it('should persist delete comment', async () => {
      const idComment = 'comment-567';      
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const deletedComment = await commentRepositoryPostgres.deleteComment(idComment);

      // Assert 
      expect(deletedComment.id).toStrictEqual(idComment);
      expect(deletedComment.deleted_at).toBeTruthy();
    });
  });
});