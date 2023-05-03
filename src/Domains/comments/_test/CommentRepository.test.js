const CommentRepository = require('../CommentRepository');

describe('CommentRepository interface', () => {
  it('should throw error then invoke unimplemented method', async () => {
    const commentRepository = new CommentRepository();

    await expect(commentRepository.addComment({})).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});