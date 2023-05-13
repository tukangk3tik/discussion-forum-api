const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const CommentUseCase = require('../CommentUseCase');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');

describe('CommentUseCase', () => {

  it('should throw error if payload not contain the content', async () => {
    //Arrange
    const useCasePayload = {};
    const commentUseCase = new CommentUseCase({});

    await expect(commentUseCase.addComment(useCasePayload))
      .rejects
      .toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if payload not meet data type', async () => {
    //Arrange
    const useCasePayload = {content: 123};
    const commentUseCase = new CommentUseCase({});

    await expect(commentUseCase.addComment(useCasePayload))
      .rejects
      .toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the add comment action correctly', async () => {
    //Arrange
    const useCasePayload = {
      content: 'Lorem impsum komentator data',
      thread_id: 'thread-321',
    };

    const mockNewComment = new AddedComment({
      id: 'comment-567',
      content: useCasePayload.content,
      owner: 'user-1234',
    });

    const thread = new DetailThread({
      id: 'thread-321',
      title: "Title thread",
      body: "Thread body",
      date: new Date().toISOString(),
      username: 'user-test',
      comments: [],
    });

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockNewComment));

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(thread));
    
    const getCommentUseCase = new CommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const newComment = await getCommentUseCase.addComment(useCasePayload);
    expect(newComment).toStrictEqual(new AddedComment({
      id: 'comment-567',
      content: useCasePayload.content,
      owner: 'user-1234',
    }));

    expect(mockCommentRepository.addComment).toBeCalledWith({
      content: useCasePayload.content,
      thread_id: 'thread-321',
    });
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-321');
  });

  it('should get comment by id action correctly', async () => {
    //Arrange
    const id = 'comment-321'; 
    const mockAddedComment = [new AddedComment({
      id: id,
      content: 'Reply for thread 5678',
      owner: 'user-1234',
    })];

    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.getCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));
    
    const getCommentUseCase = new CommentUseCase({
      commentRepository: mockCommentRepository,
    });

    const getComments = await getCommentUseCase.getCommentById(id);
    expect(getComments).toHaveLength(1);
    expect(getComments[0]).toStrictEqual(new AddedComment({
      id: 'comment-321',
      content: 'Reply for thread 5678',
      owner: 'user-1234',
    }));
    
    expect(mockCommentRepository.getCommentById).toBeCalledWith(id);
  });
 

  it('should get comment by thread id action correctly', async () => {
    //Arrange
    const threadId = 'thread-5678'; 
    const newDate = new Date();
    const mockDetailComment = [{
      id: 'comment-321',
      content: 'Reply for thread 5678',
      date: newDate,
      username: 'user-test',
      replies: [],
    }];

    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockDetailComment));
    
    const getCommentUseCase = new CommentUseCase({
      commentRepository: mockCommentRepository,
    });

    const getComments = await getCommentUseCase.getCommentByThreadId(threadId);
    expect(getComments).toHaveLength(1);
    expect(getComments[0]).toStrictEqual(new DetailComment({
      id: 'comment-321',
      content: 'Reply for thread 5678',
      date: newDate.toISOString(),
      username: 'user-test',
      replies: [],
    }));
    
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(threadId);
  });

  it('should get deleted comment by thread id action correctly', async () => {
    //Arrange
    const threadId = 'thread-5678'; 
    const newDate = new Date();
    const mockDetailComment = [{
      id: 'comment-321',
      content: 'Reply for thread 5678',
      username: 'user-test',
      date: newDate,
      deleted_at: newDate,
    }];

    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockDetailComment));
    
    const getCommentUseCase = new CommentUseCase({
      commentRepository: mockCommentRepository,
    });

    const getComments = await getCommentUseCase.getCommentByThreadId(threadId);
    expect(getComments).toHaveLength(1);
    expect(getComments[0]).toStrictEqual(new DetailComment({
      id: 'comment-321',
      content: '**komentar telah dihapus**',
      date: newDate.toISOString(),
      username: 'user-test',
      replies: [],
    }));
    
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(threadId);
  });
 
  it('should orchestrating the delete comment action correctly', async () => {
    //Arrange
    const thread = new DetailThread({
      id: 'thread-321',
      title: "Title thread",
      body: "Thread body",
      date: new Date().toISOString(),
      username: 'user-test',
      comments: [],
    });

    const payload = {
      commentId: 'comment-567',
      threadId: 'thread-123',
      owner: 'user-1234'
    };

    const deletedAt = new Date().toISOString();
    const mockDeleteComment = {
      id: payload.id,
      deleted_at: deletedAt,
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockCommentRepository.verifyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockDeleteComment));

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(thread));
    
    const getCommentUseCase = new CommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const deleteComment = await getCommentUseCase.deleteComment(payload);
    expect(deleteComment.id).toStrictEqual(payload.id);
    expect(deleteComment.deleted_at).toBeTruthy();

    expect(mockCommentRepository.deleteComment).toBeCalledWith(payload.commentId);
    expect(mockCommentRepository.verifyOwner).toBeCalledWith(
      payload.commentId, 
      payload.owner
    );
    expect(mockThreadRepository.getThreadById).toBeCalledWith(payload.threadId);
  });
});