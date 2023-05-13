const pool = require('../src/Infrastructures/database/postgres/pool');

const ReplyTableTestHelper = {
  async addReply({
    id = 'reply-567',
    content = 'Reply for comentar alsdasld asd',
    comment_id = 'comment-321',
    owner = 'user-123',
  }) {
    createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO thread_comment_replies' + 
          ' VALUES($1, $2, $3, $4, $5)' + 
          ' RETURNING id, content, owner',
        values: [id, content, comment_id, 
          owner, createdAt],
    };

    await pool.query(query);
  },

  async getReplyById(id) {
    const query = {
      text: 'SELECT * FROM thread_comment_replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async getReplyByContent(content) {
    const query = {
      text: 'SELECT * FROM thread_comment_replies WHERE content = $1',
      values: [content],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM thread_comment_replies WHERE 1=1');
  },
}

module.exports = ReplyTableTestHelper;