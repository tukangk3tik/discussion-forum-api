const NewThread = require('../../Domains/threads/entities/NewThread');

class ThreadUseCase {
  constructor({threadRepository}) {
    this._threadRepository = threadRepository;
  }

  async addNewThread(threadPayload, userId) {
    const newThread = new NewThread(threadPayload);
    return await this._threadRepository.addThread(newThread, userId);
  }
}

module.exports = ThreadUseCase;
