const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyUseCase = require('../ReplyUseCase');

describe('ReplyUseCase', () => {

  it('should throw error if payload not contain the content', async () => {
    //Arrange
    const useCasePayload = {};
    const replyUseCase = new ReplyUseCase({});

    await expect(replyUseCase.addReply(useCasePayload))
      .rejects
      .toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should orchestrating the add reply action correctly', async () => {
    //Arrange
    const useCasePayload = {
      content: 'Lorem impsum replies data',
    };

    const mockNewComment = {
      id: 'reply-567',
      content: useCasePayload.content,
      owner: 'user-1234',
    };

    const mockReplyRepository = new ReplyRepository();

    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(mockNewComment));
    
    const getReplyUseCase = new ReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    const newReply = await getReplyUseCase.addReply(useCasePayload);
    expect(newReply).toStrictEqual({
      id: 'reply-567',
      content: useCasePayload.content,
      owner: 'user-1234',
    });

    expect(mockReplyRepository.addReply).toBeCalledWith({
      content: useCasePayload.content,
    });
  });

  it('should orchestrating the get replies by comment id action correctly', async () => {
    //Arrange
    const commentId = 'comment-5678'; 
    const mockAddedReply = [new AddedReply({
      id: 'reply-321',
      content: 'Reply for comment 5678',
      owner: 'user-1234',
    })];

    const mockReplyRepository = new ReplyRepository();

    mockReplyRepository.getReplyByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedReply));
    
    const getReplyUseCase = new ReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    const getReplies = await getReplyUseCase.getReplyByCommentId(commentId);
    expect(getReplies.length).toBeTruthy();
    expect(getReplies[0]).toBeDefined();
    expect(getReplies[0]).toStrictEqual(new AddedReply({
      id: 'reply-321',
      content: 'Reply for comment 5678',
      owner: 'user-1234',
    }));
    
    expect(mockReplyRepository.getReplyByCommentId).toBeCalledWith(commentId);
  });
 
  it('should orchestrating the delete reply action correctly', async () => {
    //Arrange
    const id = 'reply-567';
    const owner = 'user-1234';

    const deletedAt = new Date().toISOString();
    const mockDeleteReply = {
      id: id,
      deleted_at: deletedAt,
    };

    const mockReplyRepository = new ReplyRepository();

    mockReplyRepository.verifyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockReplyRepository.deleteReply = jest.fn()
      .mockImplementation(() => Promise.resolve(mockDeleteReply));
    
    const getReplyUseCase = new ReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    const deletedReply = await getReplyUseCase.deleteReply(id, owner);
    expect(deletedReply.id).toStrictEqual(id);
    expect(deletedReply.deleted_at).toBeTruthy();

    expect(mockReplyRepository.deleteReply).toBeCalledWith(id);
  });

});