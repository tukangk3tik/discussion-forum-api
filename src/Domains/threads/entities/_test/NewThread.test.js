const NewThread = require('../NewThread');

describe('NewThread entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'thread title',
    };

    // Action & Assert
    expect(() => new NewThread(payload))
        .toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when title contains more than 150 character', () => {
    // Arrange
    const payload = {
      title: 'dicodingindonesiadicodingindonesiadicodingindonesiadicoding' +
        'dicodingindonesiadicodingindonesiadicodingindonesiadicoding' +
         'dicodingindonesiadicodingindonesiadicodingindonesiadi',
      body: 'Tes artikel dari dicoding',
    };

    // Action and Assert
    expect(() => new NewThread(payload))
        .toThrowError('NEW_THREAD.TITLE_LIMIT_CHAR');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 'thread title',
      body: 1234,
      owner: 'user-1234',
    };

    // Action & Assert
    expect(() => new NewThread(payload))
        .toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewThread entities correctly', () => {
    // Arrange
    const payload = {
      title: 'Thread title',
      body: 'Lorem ipsum set dolor amet',
      owner: 'user-1234',
    };

    // Action
    const newThread = new NewThread(payload);

    // Assert
    expect(newThread).toBeInstanceOf(NewThread);
    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
  });
});
