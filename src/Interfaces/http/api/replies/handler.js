const ReplyUseCase = require('../../../../Applications/use_case/ReplyUseCase');
const ThreadUseCase = require('../../../../Applications/use_case/ThreadUseCase');
const CommentUseCase = require('../../../../Applications/use_case/CommentUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const {id: userId} = request.auth.credentials;
    const {threadId, commentId} = request.params;

    request.payload.comment_id = commentId;
    request.payload.owner = userId;

    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    await threadUseCase.getThreadById(threadId);

    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    await commentUseCase.getCommentById(commentId);

    const replyUseCase = this._container.getInstance(ReplyUseCase.name); 
    const addedReply = await replyUseCase.addReply(request.payload);

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
    const {id: owner} = request.auth.credentials;
    const {
      threadId,
      commentId,
      replyId,
    } = request.params;
    
    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    await threadUseCase.getThreadById(threadId);

    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    await commentUseCase.getCommentById(commentId, owner);

    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    await replyUseCase.deleteReply(replyId, owner)
    
    return { status: 'success' }; 
  }
}

module.exports = RepliesHandler;
