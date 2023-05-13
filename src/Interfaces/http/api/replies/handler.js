const ReplyUseCase = require('../../../../Applications/use_case/ReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const {id: userId} = request.auth.credentials;

    const payload = {
      ...request.params,
      ...request.payload,
      owner: userId,
    };

    const replyUseCase = this._container.getInstance(ReplyUseCase.name); 
    const addedReply = await replyUseCase.addReply(payload);

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request) {
    const {id: userId} = request.auth.credentials;
    const payload = {
      ...request.params,
      owner: userId,
    };

    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    await replyUseCase.deleteReply(payload);
    
    return { status: 'success' }; 
  }
}

module.exports = RepliesHandler;
