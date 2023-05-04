class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.content = payload.content;
    this.date = payload.date;
    this.username = payload.username;
    this.replies = payload.replies;
  }

  _verifyPayload(payload) {
    const {id, content, date, username, replies} = payload;

    if (!id || !content || !date || !username || !replies) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (
      typeof id !== 'string' ||
      typeof content !== 'string' ||
      typeof date !== 'string' ||
      typeof username !== 'string' ||
      !Array.isArray(replies)
    ) {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailComment;