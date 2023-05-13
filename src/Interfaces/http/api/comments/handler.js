const CommentUseCase = require('../../../../Applications/use_case/CommentUseCase');
const ThreadUseCase = require('../../../../Applications/use_case/ThreadUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const {id: userId} = request.auth.credentials;
    const {id: threadId} = request.params;

    request.payload.thread_id = threadId;
    request.payload.owner = userId;

    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    const addedComment = await commentUseCase.addComment(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request) {
    const {id: owner} = request.auth.credentials; 
    let payload = {
      ...request.params,
      owner: owner,
    };

    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    await commentUseCase.deleteComment(payload);
    
    return { status: 'success' }; 
  }
}

module.exports = CommentsHandler;
