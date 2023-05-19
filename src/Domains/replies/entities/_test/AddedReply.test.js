const AddedReply = require('../AddedReply');

describe('AddedComment entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-1234',
      content: 'reply body',
    };

    // Action & Assert
    expect(() => new AddedReply(payload))
        .toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'reply-1234',
      content: 'comment body',
      owner: 123123,
    };

    // Action & Assert
    expect(() => new AddedReply(payload))
        .toThrowError('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedComment entities correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-1234',
      content: 'Comment body',
      owner: 'user-1234',
    };

    // Action
    const detailComment = new AddedReply(payload);

    // Assert
    expect(detailComment).toBeInstanceOf(AddedReply);
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.content).toEqual(payload.content);
    expect(detailComment.owner).toEqual(payload.owner);
  });
});
