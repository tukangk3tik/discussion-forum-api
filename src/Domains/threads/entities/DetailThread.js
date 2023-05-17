class DetailThread {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.title = payload.title;
    this.body = payload.body;
    this.date = payload.date.toISOString();
    this.username = payload.username;
    this.comments = payload.comments ?? [];
  }

  _verifyPayload(payload) {
    const {id, title, body, date, username} = payload;

    if (!id || !title || !body || !date || !username) {
      throw new Error('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof title !== 'string' ||
      typeof body !== 'string' ||
      Object.prototype.toString.call(date) !== '[object Date]' ||
      typeof username !== 'string'
    ) {
      throw new Error('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailThread;
