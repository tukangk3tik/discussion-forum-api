const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentUseCase = require('../CommentUseCase');

describe('CommentUseCase', () => {

  it('should throw error if payload not contain the content', async () => {
    //Arrange
    const useCasePayload = {};
    const commentUseCase = new CommentUseCase({});

    await expect(commentUseCase.addCommentOrReplies(useCasePayload))
      .rejects
      .toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should orchestrating the add comment action correctly', async () => {
    //Arrange
    const useCasePayload = {
      content: 'Lorem impsum komentator data',
    };

    const mockNewComment = {
      id: 'comment-567',
      content: useCasePayload.content,
      owner: 'user-1234',
    };

    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockNewComment));
    
    const getCommentUseCase = new CommentUseCase({
      commentRepository: mockCommentRepository,
    });

    const newComment = await getCommentUseCase.addCommentOrReplies(useCasePayload);
    expect(newComment).toStrictEqual({
      id: 'comment-567',
      content: useCasePayload.content,
      owner: 'user-1234',
    });

    expect(mockCommentRepository.addComment).toBeCalledWith({
      content: useCasePayload.content,
    });
  });
 
  it('should orchestrating the delete comment action correctly', async () => {
    //Arrange
    const useCasePayload = {
      id: 'comment-567',
      owner: 'user-1234'
    };

    const deletedAt = new Date().toISOString();
    const mockDeleteComment = {
      id: useCasePayload.id,
      deleted_at: deletedAt,
    };

    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.verifyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockDeleteComment));
    
    const getCommentUseCase = new CommentUseCase({
      commentRepository: mockCommentRepository,
    });

    const deleteComment = await getCommentUseCase.deleteCommentOrReplies(useCasePayload);
    expect(deleteComment.id).toStrictEqual(useCasePayload.id);
    expect(deleteComment.deleted_at).toBeTruthy();

    expect(mockCommentRepository.deleteComment).toBeCalledWith(useCasePayload.id);
  });

});