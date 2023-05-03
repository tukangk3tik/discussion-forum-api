const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
// const autoBind = require('auto-bind');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    //autoBind(this);
    this.postThreadsHandler = this.postThreadsHandler.bind(this);
  }

  async postThreadsHandler(request, h) {
    const {id: userId} = request.auth.credentials;
    request.payload.owner = userId;

    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(request.payload);

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
