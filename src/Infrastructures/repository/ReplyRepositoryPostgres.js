const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const DetailReply = require('../../Domains/replies/entities/DetailReply');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator){
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(addedReply){
    const {content, commentId, owner} = addedReply;
    const id = `reply-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    let query = {
      text: 'INSERT INTO thread_comment_replies' + 
        ' VALUES($1, $2, $3, $4, $5)' + 
        ' RETURNING id, content, comment_id, owner',
      values: [id, content, commentId, owner, createdAt],
    }; 
    const result = await this._pool.query(query);
    return new AddedReply(result.rows[0]);
  }

  async deleteReply(id) {
    const deletedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE thread_comment_replies SET deleted_at = $1' + 
          ' WHERE id = $2 AND deleted_at IS NULL' + 
          ' RETURNING id, deleted_at',
      values: [deletedAt, id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus. Balasan tidak ditemukan');
    }

    return { ...result.rows[0] };
  }

  async getReplyByCommentIds(commentIds) { 
    const query = {
      text: 'SELECT a.id, a.comment_id, a.content, a.created_at as date,' +
        ' a.deleted_at, b.username FROM thread_comment_replies a' + 
        ' JOIN users b ON b.id = a.owner' + 
        ' WHERE a.comment_id = ANY($1::text[])' + 
        ' ORDER by a.deleted_at',
      values: [commentIds],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async verifyOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM thread_comment_replies WHERE id = $1',
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

    return true;
  }
}

module.exports = ReplyRepositoryPostgres;