const CommentUseCase = require('../../../../Applications/use_case/CommentUseCase');
const ThreadUseCase = require('../../../../Applications/use_case/ThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this._threadUseCase = this._container.getInstance(ThreadUseCase.name);
    this.postThreadsHandler = this.postThreadsHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
  }

  async postThreadsHandler(request, h) {
    const {id: userId} = request.auth.credentials;
    const addedThread = await this._threadUseCase.addNewThread(request.payload, userId);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadByIdHandler(request) {
    const {id} = request.params;

    const thread = await this._threadUseCase.getThreadById(id);
    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    thread.comments = await commentUseCase.getCommentByThreadId(id);

    return {
      status: 'success',
      data: {
        thread,
      }
    };
  }
}

module.exports = ThreadsHandler;
