const ThreadUseCase =
    require('../../../../Applications/use_case/ThreadUseCase');
const GetThreadWithCommentAndReplyUseCase = require(
    '../../../../Applications/use_case/GetThreadWithCommentAndReplyUseCase',
);

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadsHandler = this.postThreadsHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
  }

  async postThreadsHandler(request, h) {
    const {id: userId} = request.auth.credentials;

    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    const addedThread = await threadUseCase
        .addNewThread(request.payload, userId);

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

    const getThreadUseCase = this._container.getInstance(
        GetThreadWithCommentAndReplyUseCase.name,
    );
    const thread = await getThreadUseCase.execute(id);

    return {
      status: 'success',
      data: {
        thread,
      },
    };
  }
}

module.exports = ThreadsHandler;
