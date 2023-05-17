const DetailThread = require('../DetailThread');

describe('DetailThread entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-1234',
      title: 'thread title',
      body: 'thread title',
      username: 'thread title',
    };

    // Action & Assert
    expect(() => new DetailThread(payload))
        .toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-1234',
      title: 'thread title',
      body: '123',
      date: '2021-08-08T07:19:09.775Z',
      username: 'user-1234',
      comments: '123',
    };

    // Action & Assert
    expect(() => new DetailThread(payload))
        .toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailThread entities correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-1234',
      title: 'Thread title',
      body: '123',
      date: new Date(),
      username: 'user-1234',
      comments: [],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread).toBeInstanceOf(DetailThread);
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.date).toEqual(payload.date.toISOString());
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.comments).toEqual(payload.comments);
  });
});
