const ThreadRepository = require('../ThreadRepository');

describe('ThreadRepository interface', () => {
  it('should throw error then invoke unimplemented method', async () => {
    const threadRepository = new ThreadRepository();

    await expect(threadRepository
        .addThread({}, ''))
        .rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');

    await expect(threadRepository.getThreadById(''))
        .rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');

    await expect(threadRepository.verifyThreadAvaibility(''))
        .rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
