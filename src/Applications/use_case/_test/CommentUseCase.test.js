const CommentRepository =
    require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const DetailComment =
    require('../../../Domains/comments/entities/DetailComment');
const CommentUseCase = require('../CommentUseCase');
const {use} = require('bcrypt/promises');

describe('CommentUseCase', () => {
  it('should throw error if payload not contain the content', async () => {
    // Arrange
    const useCasePayload = {};
    const commentUseCase = new CommentUseCase({});

    await expect(commentUseCase.addComment(useCasePayload))
        .rejects
        .toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if payload not meet data type', async () => {
    // Arrange
    const useCasePayload = {content: 123};
    const commentUseCase = new CommentUseCase({});

    await expect(commentUseCase.addComment(useCasePayload))
        .rejects
        .toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Lorem impsum komentator data',
      threadId: 'thread-321',
    };

    const mockNewComment = new AddedComment({
      id: 'comment-567',
      content: useCasePayload.content,
      owner: 'user-1234',
    });

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockCommentRepository.addComment = jest.fn(() =>
      Promise.resolve(mockNewComment));

    mockThreadRepository.verifyThreadAvaibility = jest.fn(() =>
      Promise.resolve());

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
      threadId: useCasePayload.threadId,
    });
    expect(mockThreadRepository.verifyThreadAvaibility)
        .toBeCalledWith('thread-321');
  });

  it('should get comment by thread id action correctly', async () => {
    // Arrange
    const threadId = 'thread-5678';
    const newDate = new Date();
    const mockDetailComment = [{
      id: 'comment-321',
      content: 'Reply for thread 5678',
      date: newDate,
      username: 'user-test',
    }];

    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.getCommentByThreadId = jest.fn(() =>
      Promise.resolve(mockDetailComment));

    const getCommentUseCase = new CommentUseCase({
      commentRepository: mockCommentRepository,
    });

    const getComments = await getCommentUseCase.getCommentByThreadId(threadId);
    expect(getComments).toHaveLength(1);
    expect(getComments[0]).toStrictEqual(new DetailComment({
      id: 'comment-321',
      content: 'Reply for thread 5678',
      date: newDate,
      username: 'user-test',
      replies: [],
    }));

    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(threadId);
  });

  it('should get deleted comment by thread id action correctly', async () => {
    // Arrange
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

    mockCommentRepository.getCommentByThreadId = jest.fn(() =>
      Promise.resolve(mockDetailComment));

    const getCommentUseCase = new CommentUseCase({
      commentRepository: mockCommentRepository,
    });

    const getComments = await getCommentUseCase.getCommentByThreadId(threadId);
    expect(getComments).toHaveLength(1);
    expect(getComments[0]).toStrictEqual(new DetailComment({
      id: 'comment-321',
      content: '**komentar telah dihapus**',
      date: newDate,
      username: 'user-test',
    }));

    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(threadId);
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const payload = {
      commentId: 'comment-567',
      threadId: 'thread-123',
      owner: 'user-1234',
    };

    const deletedAt = new Date().toISOString();
    const mockDeleteComment = {
      id: payload.id,
      deleted_at: deletedAt,
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockCommentRepository.verifyOwner = jest.fn(() =>
      Promise.resolve(true));

    mockCommentRepository.deleteComment = jest.fn(() =>
      Promise.resolve(mockDeleteComment));

    mockThreadRepository.verifyThreadAvaibility = jest.fn(() =>
      Promise.resolve());

    const getCommentUseCase = new CommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const deleteComment = await getCommentUseCase.deleteComment(payload);
    expect(deleteComment.id).toStrictEqual(payload.id);
    expect(deleteComment.deleted_at).toBeTruthy();

    expect(mockCommentRepository.deleteComment)
        .toBeCalledWith(payload.commentId);
    expect(mockCommentRepository.verifyOwner).toBeCalledWith(
        payload.commentId,
        payload.owner,
    );
    expect(mockThreadRepository.verifyThreadAvaibility)
        .toBeCalledWith(payload.threadId);
  });

  it('should orchestrating like a comment action correctly', async () => {
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-1234',
    };

    mockCommentRepository.likeComment = jest.fn(() =>
      Promise.resolve());

    mockCommentRepository.verifyCommentAvaibility = jest.fn(() =>
      Promise.resolve());

    mockThreadRepository.verifyThreadAvaibility = jest.fn(() =>
      Promise.resolve());

    mockCommentRepository.isCommentLiked = jest.fn(() =>
      Promise.resolve(false));

    const getCommentUseCase = new CommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await getCommentUseCase.likeOrUnlikeComment(useCasePayload);

    expect(mockCommentRepository.likeComment)
        .toBeCalledWith('comment-123', 'user-1234');
    expect(mockCommentRepository.isCommentLiked)
        .toBeCalledWith('comment-123', 'user-1234');
    expect(mockCommentRepository.verifyCommentAvaibility)
        .toBeCalledWith('comment-123');
    expect(mockThreadRepository.verifyThreadAvaibility)
        .toBeCalledWith('thread-123');
  });

  it('should orchestrating unlike a comment action correctly', async () => {
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-1234',
    };

    mockCommentRepository.unlikeComment = jest.fn(() =>
      Promise.resolve());

    mockCommentRepository.verifyCommentAvaibility = jest.fn(() =>
      Promise.resolve());

    mockThreadRepository.verifyThreadAvaibility = jest.fn(() =>
      Promise.resolve());

    mockCommentRepository.isCommentLiked = jest.fn(() =>
      Promise.resolve(true));

    const getCommentUseCase = new CommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await getCommentUseCase.likeOrUnlikeComment(useCasePayload);

    expect(mockCommentRepository.unlikeComment)
        .toBeCalledWith('comment-123', 'user-1234');
    expect(mockCommentRepository.isCommentLiked)
        .toBeCalledWith('comment-123', 'user-1234');
    expect(mockCommentRepository.verifyCommentAvaibility)
        .toBeCalledWith('comment-123');
    expect(mockThreadRepository.verifyThreadAvaibility)
        .toBeCalledWith('thread-123');
  });
});
