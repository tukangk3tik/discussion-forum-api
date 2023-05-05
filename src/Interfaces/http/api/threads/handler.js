const ThreadUseCase = require('../../../../Applications/use_case/ThreadUseCase');
const CommentUseCase = require('../../../../Applications/use_case/CommentUseCase');
const ReplyUseCase = require('../../../../Applications/use_case/ReplyUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadsHandler = this.postThreadsHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
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

  async getThreadByIdHandler(request) {
    const {id} = request.params;

    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    const thread = await threadUseCase.getThreadById(id);

    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    let comments = await commentUseCase.getCommentByThreadId(id);

    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    for (let i = 0; i < comments.length; i++) { 
      comments[i].replies = await replyUseCase.getReplyByCommentId(comments[i].id); 
    }
  
    thread.comments = comments;
    
    return {
      status: 'success',
      data: {
        thread,
      }
    };
  }
}

module.exports = ThreadsHandler;
