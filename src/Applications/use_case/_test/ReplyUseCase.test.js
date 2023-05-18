const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyUseCase = require('../ReplyUseCase');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');

describe('ReplyUseCase', () => {

  const thread = new DetailThread({
    id: 'thread-321',
    title: "Title thread",
    body: "Thread body",
    date: new Date().toISOString(),
    username: 'user-test',
    comments: [],
  });

  const comment = new DetailComment({
    id: 'comment-321',
    content: "Comment content",
    date: new Date().toISOString(),
    username: 'user-test',
    replies: [],
  });


  it('should throw error if payload not contain the content', async () => {
    //Arrange
    const useCasePayload = {};
    const replyUseCase = new ReplyUseCase({});

    await expect(replyUseCase.addReply(useCasePayload))
      .rejects
      .toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if payload not meet data type', async () => {
    //Arrange
    const useCasePayload = {content: 123};
    const replyUseCase = new ReplyUseCase({});

    await expect(replyUseCase.addReply(useCasePayload))
      .rejects
      .toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the add reply action correctly', async () => {
    //Arrange
    const useCasePayload = {
      content: 'Lorem impsum replies data',
      commentId: 'comment-5678',
      threadId: 'thread-321',
    };

    const mockNewReply = {
      id: 'reply-567',
      content: useCasePayload.content,
      owner: 'user-1234',
    };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(thread));
    mockCommentRepository.verifyCommentAvaibility = jest.fn(() => Promise.resolve(comment));
    mockReplyRepository.addReply = jest.fn(() => Promise.resolve(mockNewReply));

    const getReplyUseCase = new ReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const newReply = await getReplyUseCase.addReply(useCasePayload);
    expect(newReply).toStrictEqual({
      id: 'reply-567',
      content: useCasePayload.content,
      owner: 'user-1234',
    });

    expect(mockReplyRepository.addReply).toBeCalledWith({
      content: useCasePayload.content,
      commentId: 'comment-5678',
      threadId: 'thread-321',
    });
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-321');
    expect(mockCommentRepository.verifyCommentAvaibility).toBeCalledWith('comment-5678');
  });

  it('should get replies by comment id action correctly', async () => {
    //Arrange
    const commentId = 'comment-5678';
    const newDate = new Date();
    const mockAddedReply = [{
      id: 'reply-321',
      content: 'Reply for comment 5678',
      date: newDate,
      username: 'user-test',
    }];

    const mockReplyRepository = new ReplyRepository();

    mockReplyRepository.getReplyByCommentId = jest.fn(() => Promise.resolve(mockAddedReply));

    const getReplyUseCase = new ReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    const getReplies = await getReplyUseCase.getReplyByCommentId(commentId);
    expect(getReplies).toHaveLength(1);
    expect(getReplies[0]).toStrictEqual(new DetailReply({
      id: 'reply-321',
      content: 'Reply for comment 5678',
      date: newDate.toISOString(),
      username: 'user-test',
    }));

    expect(mockReplyRepository.getReplyByCommentId).toBeCalledWith(commentId);
  });

  it('should get deleted replies by comment id action correctly', async () => {
    //Arrange
    const commentId = 'comment-5678';
    const newDate = new Date();
    const mockAddedReply = [{
      id: 'reply-321',
      content: 'Reply for comment 5678',
      date: newDate,
      username: 'user-test',
      deleted_at: newDate,
    }];

    const mockReplyRepository = new ReplyRepository();

    mockReplyRepository.getReplyByCommentId = jest.fn(() => Promise.resolve(mockAddedReply));

    const getReplyUseCase = new ReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    const getReplies = await getReplyUseCase.getReplyByCommentId(commentId);
    expect(getReplies).toHaveLength(1);
    expect(getReplies[0]).toStrictEqual(new DetailReply({
      id: 'reply-321',
      content: '**balasan telah dihapus**',
      date: newDate.toISOString(),
      username: 'user-test',
    }));

    expect(mockReplyRepository.getReplyByCommentId).toBeCalledWith(commentId);
  });


  it('should orchestrating the delete reply action correctly', async () => {
    //Arrange
    const payload = {
      replyId: 'reply-567',
      commentId: 'comment-567',
      threadId: 'thread-123',
      owner: 'user-1234'
    };

    const deletedAt = new Date().toISOString();
    const mockDeleteReply = {
      id: payload.replyId,
      deleted_at: deletedAt,
    };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(thread));
    mockCommentRepository.verifyCommentAvaibility = jest.fn(() => Promise.resolve(comment));
    mockReplyRepository.verifyOwner = jest.fn(() => Promise.resolve(true));
    mockReplyRepository.deleteReply = jest.fn(() => Promise.resolve(mockDeleteReply));

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
      payload.owner
    );
    expect(mockThreadRepository.getThreadById).toBeCalledWith(payload.threadId);
    expect(mockCommentRepository.verifyCommentAvaibility).toBeCalledWith(payload.commentId);
  });
});
