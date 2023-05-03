const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NewThread = require('../../Domains/threads/entities/NewThread');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(thread) {
    const {title, body, owner} = thread;
    const id = `thread-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5)' + 
        ' RETURNING id, title, body, owner',
      values: [id, title, body, owner, createdAt],
    };

    const result = await this._pool.query(query);
    return new NewThread({...result.rows[0]});
  }
}

module.exports = ThreadRepositoryPostgres;