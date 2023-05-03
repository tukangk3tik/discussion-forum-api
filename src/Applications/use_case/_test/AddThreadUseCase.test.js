const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const NewThread = require("../../../Domains/threads/entities/NewThread");
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    //Arrange
    const useCasePayload = {
      title: 'SWE Clean Architecture',
      body: 'Lorem ipsum set dolor amet',
    };

    const mockNewThread = new NewThread({
      id: 'thread-321',
      title: useCasePayload.title,
      body: useCasePayload.body,
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockNewThread));
    
    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const newThread = await getThreadUseCase.execute(useCasePayload);
    // console.log(newThread);
    expect(newThread).toStrictEqual(new NewThread({
      id: 'thread-321',
      title: useCasePayload.title,
      body: useCasePayload.body,
    }));

    expect(mockThreadRepository.addThread).toBeCalledWith(new NewThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
    }))
  });
});