const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository =
    require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyUseCase = require('../ReplyUseCase');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

describe('ReplyUseCase', () => {
  it('should throw error if payload not contain the content', async () => {
    // Arrange
    const useCasePayload = {};
    const replyUseCase = new ReplyUseCase({});

    await expect(replyUseCase.addReply(useCasePayload))
        .rejects
        .toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if payload not meet data type', async () => {
    // Arrange
    const useCasePayload = {content: 123};
    const replyUseCase = new ReplyUseCase({});

    await expect(replyUseCase.addReply(useCasePayload))
        .rejects
        .toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Lorem impsum replies data',
      commentId: 'comment-5678',
      threadId: 'thread-321',
    };

    const mockNewReply = new AddedReply({
      id: 'reply-567',
      content: useCasePayload.content,
      owner: 'user-1234',
    });

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadAvaibility = jest.fn(() =>
      Promise.resolve());
    mockCommentRepository.verifyCommentAvaibility = jest.fn(() =>
      Promise.resolve());
    mockReplyRepository.addReply = jest.fn(() =>
      Promise.resolve(mockNewReply));

    const getReplyUseCase = new ReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const newReply = await getReplyUseCase.addReply(useCasePayload);
    expect(newReply).toStrictEqual(new AddedReply({
      id: 'reply-567',
      content: useCasePayload.content,
      owner: 'user-1234',
    }));

    expect(mockReplyRepository.addReply).toBeCalledWith({
      content: useCasePayload.content,
      commentId: 'comment-5678',
      threadId: 'thread-321',
    });
    expect(mockThreadRepository.verifyThreadAvaibility)
        .toBeCalledWith('thread-321');
    expect(mockCommentRepository.verifyCommentAvaibility)
        .toBeCalledWith('comment-5678');
  });

  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const payload = {
      replyId: 'reply-567',
      commentId: 'comment-567',
      threadId: 'thread-123',
      owner: 'user-1234',
    };

    const deletedAt = new Date();
    const mockDeleteReply = {
      id: payload.replyId,
      deleted_at: deletedAt,
    };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadAvaibility = jest.fn(() =>
      Promise.resolve());
    mockCommentRepository.verifyCommentAvaibility = jest.fn(() =>
      Promise.resolve());
    mockReplyRepository.verifyOwner = jest.fn(() =>
      Promise.resolve());
    mockReplyRepository.deleteReply = jest.fn(() =>
      Promise.resolve(mockDeleteReply));

    const getReplyUseCase = new ReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const deletedReply = await getReplyUseCase.deleteReply(payload);
    expect(deletedReply.id).toStrictEqual(payload.replyId);
    expect(deletedReply.deleted_at).toBeTruthy();

    expect(mockReplyRepository.deleteReply).toBeCalledWith(payload.replyId);
    expect(mockReplyRepository.verifyOwner).toBeCalledWith(
        payload.replyId,
        payload.owner,
    );
    expect(mockThreadRepository.verifyThreadAvaibility)
        .toBeCalledWith(payload.threadId);
    expect(mockCommentRepository.verifyCommentAvaibility)
        .toBeCalledWith(payload.commentId);
  });
});
