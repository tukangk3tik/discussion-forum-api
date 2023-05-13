const CommentRepository = require("../../../Domains/comments/CommentRepository");
const DetailComment = require("../../../Domains/comments/entities/DetailComment");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const DetailReply = require("../../../Domains/replies/entities/DetailReply");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const DetailThread = require("../../../Domains/threads/entities/DetailThread");
const NewThread = require("../../../Domains/threads/entities/NewThread");
const ThreadUseCase = require('../ThreadUseCase');

describe('ThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    //Arrange
    const useCasePayload = {
      title: 'SWE Clean Architecture',
      body: 'Lorem ipsum set dolor amet',
    };
    const owner = 'user-1234'

    const mockNewThread = new AddedThread({
      id: 'thread-321',
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: 'user-1234',
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockNewThread));
    
    const getThreadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const newThread = await getThreadUseCase.addNewThread(useCasePayload, owner);
    expect(newThread).toStrictEqual(new AddedThread({
      id: 'thread-321',
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: 'user-1234',
    }));

    expect(mockThreadRepository.addThread).toBeCalledWith(
        new NewThread({
          title: useCasePayload.title,
          body: useCasePayload.body,
        }), 
        owner
    );
  });

  it('should get thread with comment and replies correctly', async () => {
    //Arrange
    const newDate = new Date().toISOString();
    
    const mockAddedThread = new DetailThread({
      id: 'thread-321',
      title: 'Title thread',
      body: 'Body thread',
      date: newDate,
      username: 'user-test',
      comments: [],
    });

    const mockComment = [new DetailComment({
      id: 'comment-123',
      content: 'Comment content',
      date: newDate,
      username: 'user-test',
      replies: [],
    })];

    const mockReply = [new DetailReply({
      id: 'reply-123',
      content: 'Reply content',
      date: newDate,
      username: 'user-test',
    })];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));

    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComment));

    mockReplyRepository.getReplyByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReply));
    
    const getThreadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const newThread = await getThreadUseCase.getThreadById(mockAddedThread.id);

    mockComment[0].replies = mockReply;
    expect(newThread).toStrictEqual(new DetailThread({
      id: 'thread-321',
      title: 'Title thread',
      body: 'Body thread',
      date: newDate,
      username: 'user-test',
      comments: mockComment,
    }));

    expect(mockThreadRepository.getThreadById).toBeCalledWith(mockAddedThread.id);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(mockAddedThread.id);
    expect(mockReplyRepository.getReplyByCommentId).toBeCalledWith(mockComment[0].id);
  });
});