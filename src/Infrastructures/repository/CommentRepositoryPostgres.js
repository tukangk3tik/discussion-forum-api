const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator){
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(comment){
    const {content, thread_id, owner} = comment;
    const id = `comment-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    let query = {
      text: 'INSERT INTO thread_comments' + 
        ' VALUES($1, $2, $3, $4, $5)' + 
        ' RETURNING id, content, thread_id, owner',
      values: [id, content, thread_id, owner, createdAt],
    }; 
    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async deleteComment(id) {
    const deletedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE thread_comments SET deleted_at = $1' + 
          ' WHERE id = $2 AND deleted_at IS NULL' + 
          ' RETURNING id, deleted_at',
      values: [deletedAt, id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus. Komentar tidak ditemukan');
    }

    return { ...result.rows[0] };
  }

  async verifyOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM thread_comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Resource yang Anda minta tidak ditemukan');
    }

    const comment = result.rows[0];
    if (comment.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource');
    }
  }
}

module.exports = CommentRepositoryPostgres;