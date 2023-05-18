const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment =
    require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository =
    require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThreadWithCommentAndReplyUseCase =
    require('../../use_case/GetThreadWithCommentAndReplyUseCase');

describe('GetThreadWithCommentAndReplyUseCase', () => {
  const newDate = new Date();
  const mockAddedThread = new DetailThread({
    id: 'thread-321',
    title: 'Title thread',
    body: 'Body thread',
    date: newDate,
    username: 'user-test',
  });

  it('should get thread with comment and replies correctly', async () => {
    // Arrange
    const mockComment = [{
      id: 'comment-123',
      content: 'Comment content',
      date: newDate,
      username: 'user-test',
    }];

    const mockReply = [{
      id: 'reply-123',
      content: 'Reply content',
      date: newDate,
      username: 'user-test',
      comment_id: 'comment-123',
    }];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById =
          jest.fn(() => Promise.resolve(mockAddedThread));

    mockCommentRepository.getCommentByThreadId =
          jest.fn(() => Promise.resolve(mockComment));

    mockReplyRepository.getReplyByCommentIds =
          jest.fn(() => Promise.resolve(mockReply));

    const getThreadUseCase = new GetThreadWithCommentAndReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const getThread = await getThreadUseCase.execute(mockAddedThread.id);

    const expectedReply = [new DetailReply({
      id: 'reply-123',
      content: 'Reply content',
      date: newDate,
      username: 'user-test',
    })];

    const expectedComment = [new DetailComment({
      id: 'comment-123',
      content: 'Comment content',
      date: newDate,
      username: 'user-test',
      replies: expectedReply,
    })];

    expect(getThread).toStrictEqual(new DetailThread({
      id: 'thread-321',
      title: 'Title thread',
      body: 'Body thread',
      date: newDate,
      username: 'user-test',
      comments: expectedComment,
    }));

    expect(mockThreadRepository.getThreadById)
        .toBeCalledWith(mockAddedThread.id);

    expect(mockCommentRepository.getCommentByThreadId)
        .toBeCalledWith(mockAddedThread.id);

    expect(mockReplyRepository.getReplyByCommentIds)
        .toBeCalledWith([mockComment[0].id]);
  });

  it('should get thread with deleted comment', async () => {
    // Arrange
    const mockComment = [{
      id: 'comment-123',
      content: 'Comment content',
      date: newDate,
      username: 'user-test',
      deleted_at: newDate,
    }];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById =
        jest.fn(() => Promise.resolve(mockAddedThread));

    mockCommentRepository.getCommentByThreadId =
        jest.fn(() => Promise.resolve(mockComment));

    mockReplyRepository.getReplyByCommentIds =
        jest.fn(() => Promise.resolve([]));

    const getThreadUseCase = new GetThreadWithCommentAndReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const getThread = await getThreadUseCase.execute(mockAddedThread.id);

    const expectedComment = [new DetailComment({
      id: 'comment-123',
      content: '**komentar telah dihapus**',
      date: newDate,
      username: 'user-test',
      replies: [],
    })];

    expect(getThread).toStrictEqual(new DetailThread({
      id: 'thread-321',
      title: 'Title thread',
      body: 'Body thread',
      date: newDate,
      username: 'user-test',
      comments: expectedComment,
    }));

    expect(mockThreadRepository.getThreadById)
        .toBeCalledWith(mockAddedThread.id);

    expect(mockCommentRepository.getCommentByThreadId)
        .toBeCalledWith(mockAddedThread.id);

    expect(mockReplyRepository.getReplyByCommentIds)
        .toBeCalledWith([mockComment[0].id]);
  });

  it('should get thread and comment with deleted reply', async () => {
    // Arrange
    const mockComment = [{
      id: 'comment-123',
      content: 'Comment content',
      date: newDate,
      username: 'user-test',
    }];

    const mockReply = [{
      id: 'reply-123',
      content: 'Reply content',
      date: newDate,
      username: 'user-test',
      comment_id: 'comment-123',
      deleted_at: newDate,
    }];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById =
        jest.fn(() => Promise.resolve(mockAddedThread));

    mockCommentRepository.getCommentByThreadId =
        jest.fn(() => Promise.resolve(mockComment));

    mockReplyRepository.getReplyByCommentIds =
        jest.fn(() => Promise.resolve(mockReply));

    const getThreadUseCase = new GetThreadWithCommentAndReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const getThread = await getThreadUseCase.execute(mockAddedThread.id);

    const expectedReply = [new DetailReply({
      id: 'reply-123',
      content: '**balasan telah dihapus**',
      date: newDate,
      username: 'user-test',
    })];

    const expectedComment = [new DetailComment({
      id: 'comment-123',
      content: 'Comment content',
      date: newDate,
      username: 'user-test',
      replies: expectedReply,
    })];

    expect(getThread).toStrictEqual(new DetailThread({
      id: 'thread-321',
      title: 'Title thread',
      body: 'Body thread',
      date: newDate,
      username: 'user-test',
      comments: expectedComment,
    }));

    expect(mockThreadRepository.getThreadById)
        .toBeCalledWith(mockAddedThread.id);

    expect(mockCommentRepository.getCommentByThreadId)
        .toBeCalledWith(mockAddedThread.id);

    expect(mockReplyRepository.getReplyByCommentIds)
        .toBeCalledWith([mockComment[0].id]);
  });
});
