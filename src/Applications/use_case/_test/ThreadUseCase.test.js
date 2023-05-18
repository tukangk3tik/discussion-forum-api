const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const ThreadUseCase = require('../ThreadUseCase');

describe('ThreadUseCase', () => {
  it('should throw error if payload not contain the content', async () => {
    // Arrange
    const useCasePayload = {};
    const threadUseCase = new ThreadUseCase({});

    await expect(threadUseCase.addNewThread(useCasePayload))
        .rejects
        .toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if title ' +
      'length more than 150 characters', async () => {

    // Arrange
    const useCasePayload = {
      title: 'dicodingindonesiadicodingindonesiadicodingindonesiadicoding' +
          'dicodingindonesiadicodingindonesiadicodingindonesiadicoding' +
          'dicodingindonesiadicodingindonesiadicodingindonesiadi',
      body: '1231asdas',
    };
    const threadUseCase = new ThreadUseCase({});

    await expect(threadUseCase.addNewThread(useCasePayload))
        .rejects
        .toThrowError('NEW_THREAD.TITLE_LIMIT_CHAR');
  });

  it('should throw error if payload not meet data type', async () => {
    // Arrange
    const useCasePayload = {title: 'Test 123', body: 123};
    const threadUseCase = new ThreadUseCase({});

    await expect(threadUseCase.addNewThread(useCasePayload))
        .rejects
        .toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'SWE Clean Architecture',
      body: 'Lorem ipsum set dolor amet',
    };
    const owner = 'user-1234';

    const mockNewThread = new AddedThread({
      id: 'thread-321',
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: 'user-1234',
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread =
        jest.fn(() => Promise.resolve(mockNewThread));

    const getThreadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const newThread = await getThreadUseCase
        .addNewThread(useCasePayload, owner);

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
        owner,
    );
  });
});
