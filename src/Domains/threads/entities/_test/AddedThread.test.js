const AddedThread = require('../AddedThread');

describe('AddedThread entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-1234',
      title: 'thread title',
    };

    // Action & Assert
    expect(() => new AddedThread(payload))
        .toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-1234',
      title: 'thread title',
      body: 1234,
      owner: 'user-1234',
    };

    // Action & Assert
    expect(() => new AddedThread(payload))
        .toThrowError('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedThread entities correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-1234',
      title: 'Thread title',
      body: 'Lorem ipsum set dolor amet',
      owner: 'user-1234',
    };

    // Action
    const addedThread = new AddedThread(payload);

    // Assert
    expect(addedThread).toBeInstanceOf(AddedThread);
    expect(addedThread.id).toEqual(payload.id);
    expect(addedThread.title).toEqual(payload.title);
    expect(addedThread.body).toEqual(payload.body);
    expect(addedThread.owner).toEqual(payload.owner);
  });
});
