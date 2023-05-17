const NewThread = require('../../Domains/threads/entities/NewThread');

class ThreadUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async addNewThread(threadPayload, userId) {
    const newThread = new NewThread(threadPayload);
    return await this._threadRepository.addThread(newThread, userId);
  }

  async getThreadById(id) {
    const thread = await this._threadRepository.getThreadById(id);
    const comments = await this._commentRepository.getCommentByThreadId(id);
    const commentIds = comments.map((item) => {
      return item.id;
    });

    const allReply = await this._replyRepository
        .getReplyByCommentIds(commentIds);

    for (let i = 0; i < comments.length; i++) {
      comments[i].replies = allReply.filter((item) => {
        if (item.comment_id === comments[i].id) {
          return item;
        }
      });
    }

    thread.comments = comments;
    return thread;
  }
}

module.exports = ThreadUseCase;
