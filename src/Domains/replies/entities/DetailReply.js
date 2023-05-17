class DetailReply {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.content = payload.content;
    this.date = payload.date.toISOString();
    this.username = payload.username;
  }

  _verifyPayload(payload) {
    const {id, content, date, username} = payload;

    if (!id || !content || !date || !username) {
      throw new Error('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (
      typeof id !== 'string' ||
      typeof content !== 'string' ||
      Object.prototype.toString.call(date) !== '[object Date]' ||
      typeof username !== 'string'
    ) {
      throw new Error('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailReply;