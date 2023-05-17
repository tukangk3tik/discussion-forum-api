const DetailReply = require("../../Domains/replies/entities/DetailReply");

class ReplyUseCase {
  constructor({
    replyRepository, commentRepository, threadRepository,
  }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async addReply(useCasePayload){
    this._verifyReplyPayload(useCasePayload);
 
    const {threadId, commentId} = useCasePayload;
    await this._threadRepository.getThreadById(threadId);
    await this._commentRepository.getCommentById(commentId);

    return await this._replyRepository.addReply(useCasePayload);
  }

  async deleteReply(useCasePayload){
    const {threadId, commentId, replyId, owner} = useCasePayload; 

    await this._threadRepository.getThreadById(threadId);
    await this._commentRepository.getCommentById(commentId);

    await this._replyRepository.verifyOwner(replyId, owner);
    return await this._replyRepository.deleteReply(replyId);
  }

  async getReplyByCommentId(id) { 
    const result = await this._replyRepository.getReplyByCommentId(id);
    const final = result.map((item) => {
      if (item.deleted_at) {
        item.content = '**balasan telah dihapus**';
      }
      return item;
    });

    return final.map((item) => new DetailReply(item));
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