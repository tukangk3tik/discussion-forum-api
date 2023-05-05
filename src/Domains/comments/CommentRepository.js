class CommentRepository {
  async addComment(addedComment) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async deleteComment(id) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async getCommentByThreadId(threadId) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED') 
  }

  async verifyOwner(id, owner) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }
}

module.exports = CommentRepository;