const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentTableTestHelper = {
  async addComment({
    id = 'comment-567',
    content = 'Comment for SWE Clean Architecture lorem',
    thread_id = 'thread-321',
    replies_parent = null,
    owner = 'user-123',
  }) {
    createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO thread_comments' + 
          ' VALUES($1, $2, $3, $4, $5, $6)' + 
          ' RETURNING id, content, replies_parent, owner',
        values: [id, content, thread_id, 
          replies_parent, owner, createdAt],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM thread_comments WHERE 1=1');
  },
}

module.exports = CommentTableTestHelper;