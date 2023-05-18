const DetailComment = require('../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../Domains/replies/entities/DetailReply');

class GetThreadWithCommentAndReplyUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(id) {
    const thread = await this._threadRepository.getThreadById(id);
    const comments = await this._commentRepository.getCommentByThreadId(id);

    const commentIds = [];
    const mappedComments = comments.map((item) => {
      commentIds.push(item.id);
      item.content = (item.deleted_at) ?
          '**komentar telah dihapus**' :
          item.content;

      return new DetailComment(item);
    });

    const allReply = await this._replyRepository
        .getReplyByCommentIds(commentIds);

    for (let i = 0; i < mappedComments.length; i++) {
      mappedComments[i].replies = allReply.map((reply) => {
        if (reply.comment_id === mappedComments[i].id) {
          reply.content = (reply.deleted_at) ?
              '**balasan telah dihapus**' :
              reply.content;

          return new DetailReply(reply);
        }
      });
    }

    thread.comments = mappedComments;
    return thread;
  }
}

module.exports = GetThreadWithCommentAndReplyUseCase;
