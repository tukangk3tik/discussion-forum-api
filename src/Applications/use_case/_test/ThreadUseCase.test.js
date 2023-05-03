const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const NewThread = require("../../../Domains/threads/entities/NewThread");
const ThreadUseCase = require('../ThreadUseCase');

describe('ThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    //Arrange
    const useCasePayload = {
      title: 'SWE Clean Architecture',
      body: 'Lorem ipsum set dolor amet',
      owner: 'user-1234',
    };

    const mockNewThread = new NewThread({
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

    const newThread = await getThreadUseCase.addNewThread(useCasePayload);
    expect(newThread).toStrictEqual(new NewThread({
      id: 'thread-321',
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: 'user-1234',
    }));

    expect(mockThreadRepository.addThread).toBeCalledWith(new NewThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: 'user-1234',
    }))
  });

  it('should orchestrating the get thread action correctly', async () => {
    //Arrange
    const useCasePayload = {
      title: 'SWE Clean Architecture',
      body: 'Lorem ipsum set dolor amet',
      owner: 'user-1234',
    };

    const mockAddedThread = new AddedThread({
      id: 'thread-321',
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: 'user-1234',
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));
    
    const getThreadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const newThread = await getThreadUseCase.getThreadById(mockAddedThread.id);
    expect(newThread).toStrictEqual(new AddedThread({
      id: 'thread-321',
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: 'user-1234',
    }));

    expect(mockThreadRepository.getThreadById).toBeCalledWith(mockAddedThread.id);
  });
});