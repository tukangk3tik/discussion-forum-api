class ReplyUseCase {
  constructor({replyRepository}) {
    this._replyRepository = replyRepository;
  }

  async addReply(useCasePayload){
    this._verifyReplyPayload(useCasePayload);
    return await this._replyRepository.addReply(useCasePayload);
  }

  async deleteReply(id, owner){
    await this._replyRepository.verifyOwner(id, owner);
    return await this._replyRepository.deleteReply(id);
  }

  async getReplyByCommentId(id) { 
    return await this._replyRepository.getReplyByCommentId(id);
  }

  _verifyReplyPayload(payload) {
    const {content} = payload;

    if (!content) {
      throw new Error('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof content !== 'string') {
      throw new Error('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ReplyUseCase;