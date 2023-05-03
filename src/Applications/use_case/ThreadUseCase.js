const NewThread = require('../../Domains/threads/entities/NewThread');

class ThreadUseCase {
  constructor({threadRepository}) {
    this._threadRepository = threadRepository;
  }

  async addNewThread(threadPayload) {
    const newThread = new NewThread(threadPayload); 
    return await this._threadRepository.addThread(newThread);
  }

  async getThreadById(id) {
    return await this._threadRepository.getThreadById(id);
  }
}

module.exports = ThreadUseCase;