const DetailComment = require('../DetailComment');

describe('DetailComment entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-1234',
      content: 'comment content this',
      username: 'thread title',
    };

    // Action & Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-1234',
      content: 'comment content this',
      date: '2021-08-08T07:19:09.775Z',
      username: 'user-1234',
      replies: '123',
    };

    // Action & Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailThread entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-1234',
      content: 'comment content this',
      date: '2021-08-08T07:19:09.775Z',
      username: 'user-1234',
      replies: [],
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment).toBeInstanceOf(DetailComment);
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.content).toEqual(payload.content);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.replies).toEqual(payload.replies);
  });
});