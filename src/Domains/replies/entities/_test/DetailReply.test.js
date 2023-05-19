const DetailReply = require('../DetailReply');

describe('DetailReply entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-1234',
      content: 'reply comment this',
      username: 'user-1234',
    };

    // Action & Assert
    expect(() => new DetailReply(payload))
        .toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-1234',
      content: 'comment content this',
      date: '2021-08-08T07:19:09.775Z',
      username: 1234,
    };

    // Action & Assert
    expect(() => new DetailReply(payload))
        .toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailReply entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-1234',
      content: 'comment content this',
      date: new Date(),
      username: 'user-1234',
    };

    // Action
    const detailComment = new DetailReply(payload);

    // Assert
    expect(detailComment).toBeInstanceOf(DetailReply);
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.content).toEqual(payload.content);
    expect(detailComment.date).toEqual(payload.date.toISOString());
    expect(detailComment.username).toEqual(payload.username);
  });
});
