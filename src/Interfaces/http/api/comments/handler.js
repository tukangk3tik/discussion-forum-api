const CommentUseCase = require('../../../../Applications/use_case/CommentUseCase');
const { mapAddCommentToResponse } = require('../../../mapper/comment_map');
const ThreadUseCase = require('../../../../Applications/use_case/ThreadUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const {id: userId} = request.auth.credentials;
    const {id: threadId} = request.params;

    request.payload.thread_id = threadId;
    request.payload.owner = userId;

    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    await threadUseCase.getThreadById(threadId);

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

  async deleteCommentHandler(request, h) {
    const {id: owner} = request.auth.credentials;
    const {
      thread_id: threadId,
      comment_id: commentId
    } = request.params;

    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    await threadUseCase.getThreadById(threadId);

    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    await commentUseCase.deleteComment(commentId, owner);
    
    return { status: 'success' }; 
  }
}

module.exports = CommentsHandler;
