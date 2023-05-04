const ThreadUseCase = require('../../../../Applications/use_case/ThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadsHandler = this.postThreadsHandler.bind(this);
  }

  async postThreadsHandler(request, h) {
    const {id: userId} = request.auth.credentials;

    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    const addedThread = await threadUseCase.addNewThread(request.payload, userId);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = ThreadsHandler;
