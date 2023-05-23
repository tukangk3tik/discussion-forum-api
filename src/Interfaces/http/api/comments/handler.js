const CommentUseCase =
    require('../../../../Applications/use_case/CommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.likeOrUnlikeCommentHandler =
      this.likeOrUnlikeCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const {id: userId} = request.auth.credentials;
    const {id: threadId} = request.params;

    request.payload.threadId = threadId;
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
    const payload = {
      ...request.params,
      owner: owner,
    };

    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    await commentUseCase.deleteComment(payload);

    return {status: 'success'};
  }

  async likeOrUnlikeCommentHandler(request) {
    const {id: owner} = request.auth.credentials;
    const payload = {
      ...request.params,
      owner: owner,
    };

    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    await commentUseCase.likeOrUnlikeComment(payload);

    return {status: 'success'};
  }
}

module.exports = CommentsHandler;
