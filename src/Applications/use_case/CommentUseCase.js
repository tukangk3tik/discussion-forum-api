class CommentUseCase {
  constructor({commentRepository}) {
    this._commentRepository = commentRepository;
  }

  async addCommentOrReplies(useCasePayload){
    this._verifyCommentPayload(useCasePayload);
    return await this._commentRepository.addComment(useCasePayload);
  }

  async deleteCommentOrReplies(useCasePayload){
    const {id, owner} = useCasePayload;
    await this._commentRepository.verifyOwner(id, owner);
    return await this._commentRepository.deleteComment(id);
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