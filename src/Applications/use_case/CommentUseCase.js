const DetailComment = require('../../Domains/comments/entities/DetailComment');

class CommentUseCase {
  constructor({commentRepository, threadRepository}) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async addComment(useCasePayload){
    this._verifyCommentPayload(useCasePayload);

    const {thread_id: threadId} = useCasePayload; 
    await this._threadRepository.getThreadById(threadId);

    return await this._commentRepository.addComment(useCasePayload);
  }

  async deleteComment(useCasePayload){
    const {threadId, commentId, owner} = useCasePayload; 
    await this._threadRepository.getThreadById(threadId);
    
    await this._commentRepository.verifyOwner(commentId, owner);
    return await this._commentRepository.deleteComment(commentId);
  }

  async getCommentById(id) {
    return await this._commentRepository.getCommentById(id);
  }

  async getCommentByThreadId(id) {
    const result = await this._commentRepository.getCommentByThreadId(id);
    const final = result.map((item) => {
      if (item.deleted_at) {
        item.content = '**komentar telah dihapus**';
      }
      return item;
    });

    return final.map((item) => new DetailComment(item));
  }

  _verifyCommentPayload(payload) {
    const {content, thread_id} = payload;

    if (!content) {
      throw new Error('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof content !== 'string') {
      throw new Error('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentUseCase;