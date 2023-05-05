class CommentUseCase {
  constructor({commentRepository}) {
    this._commentRepository = commentRepository;
  }

  async addComment(useCasePayload){
    this._verifyCommentPayload(useCasePayload);
    return await this._commentRepository.addComment(useCasePayload);
  }

  async deleteComment(id, owner){
    await this._commentRepository.verifyOwner(id, owner);
    return await this._commentRepository.deleteComment(id);
  }

  async getCommentById(id) {
    return await this._commentRepository.getCommentById(id);
  }

  async getCommentByThreadId(id) {
    return await this._commentRepository.getCommentByThreadId(id);
  }

  _verifyCommentPayload(payload) {
    const {content} = payload;

    if (!content) {
      throw new Error('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof content !== 'string') {
      throw new Error('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentUseCase;