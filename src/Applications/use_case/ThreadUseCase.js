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
    let comments = await this._commentRepository.getCommentByThreadId(id);

    for (let i = 0; i < comments.length; i++) { 
      comments[i].replies = await this._replyRepository
        .getReplyByCommentId(comments[i].id); 
    }
  
    thread.comments = comments;
    return thread;
  }
}

module.exports = ThreadUseCase;