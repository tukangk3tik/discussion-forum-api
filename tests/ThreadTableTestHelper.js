const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadTableTestHelper = {
  async addThread({
    id = 'thread-321',
    title = 'SWE Clean Architecture',
    body = 'Lorem ipsum set dolor amet',
    owner = 'user-123',
  }) {
    createdAt = new Date().toISOString;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5)',
      values: [id, title, body, owner, createdAt],
    };

    await pool.query(query);
  },

  async getThreadById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
}

module.exports = ThreadTableTestHelper;