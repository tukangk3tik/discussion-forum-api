/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentTableTestHelper = {
  async addComment({
    id = 'comment-567',
    content = 'Comment for SWE Clean Architecture lorem',
    thread_id = 'thread-321',
    owner = 'user-123',
  }) {
    createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO thread_comments' +
          ' VALUES($1, $2, $3, $4, $5)' +
          ' RETURNING id, content, owner',
      values: [id, content, thread_id,
        owner, createdAt],
    };

    await pool.query(query);
  },

  async deleteComment(id = 'comment-567') {
    deletedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE thread_comments SET deleted_at = $1' +
          ' WHERE id = $2 AND deleted_at IS NULL' +
          ' RETURNING id, deleted_at',
      values: [deletedAt, id],
    };

    await pool.query(query);
  },

  async getCommentByContent(content) {
    const query = {
      text: 'SELECT * FROM thread_comments WHERE content = $1',
      values: [content],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async addCommentLike({
    id = 'commentlike-123',
    commentId = 'comment-321',
    owner = 'user-123',
  }) {
    const query = {
      text: 'INSERT INTO thread_comment_likes' +
        ' VALUES($1, $2, $3)' +
        ' RETURNING id, owner',
      values: [id, commentId, owner],
    };

    await pool.query(query);
  },

  async getCommentLike({
    commentId = 'comment-321',
    owner = 'user-123',
  }) {
    const query = {
      text: 'SELECT id FROM thread_comment_likes' +
        ' WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM thread_comments WHERE 1=1');
  },

  async cleanLikeTable() {
    await pool.query('DELETE FROM thread_comment_likes WHERE 1=1');
  },
};

module.exports = CommentTableTestHelper;
