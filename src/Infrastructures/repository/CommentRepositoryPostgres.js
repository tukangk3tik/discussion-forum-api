const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError =
    require('../../Commons/exceptions/AuthorizationError');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator){
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(comment){
    const {content, threadId, owner} = comment;
    const id = `comment-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO thread_comments' +
        ' VALUES($1, $2, $3, $4, $5)' +
        ' RETURNING id, content, thread_id, owner',
      values: [id, content, threadId, owner, createdAt],
    };
    const result = await this._pool.query(query);
    return new AddedComment(result.rows[0]);
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

    return {...result.rows[0]};
  }

  async verifyCommentAvaibility(id) {
    const query = {
      text: 'SELECT * from thread_comments' +
        ' WHERE id = $1 AND deleted_at IS NULL',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }
  }

  async getCommentByThreadId(threadId) {
    const query = {
      text: 'SELECT a.id, a.content, a.created_at as date,' +
        ' a.deleted_at, b.username,' +
        ' (SELECT COUNT(id) FROM thread_comment_likes' +
        ' WHERE comment_id = a.id) as like_count' +
        ' FROM thread_comments a' +
        ' JOIN users b ON b.id = a.owner' +
        ' WHERE a.thread_id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async likeComment(commentId, owner){
    const id = `commentlike-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO thread_comment_likes' +
        ' VALUES($1, $2, $3)',
      values: [id, commentId, owner],
    };
    await this._pool.query(query);
  }

  async unlikeComment(commentId, owner){
    const query = {
      text: 'DELETE FROM thread_comment_likes' +
        ' WHERE comment_id = $1 AND owner = $2' +
        ' RETURNING id',
      values: [commentId, owner],
    };
    await this._pool.query(query);
  }

  async isCommentLiked(commentId, owner) {
    const query = {
      text: 'SELECT id FROM thread_comment_likes' +
        ' WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
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
