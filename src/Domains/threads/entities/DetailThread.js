class DetailThread {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.title = payload.title;
    this.body = payload.body;
    this.date = payload.date;
    this.username = payload.username;
    this.comments = payload.comments;
  }

  _verifyPayload(payload) {
    const {id, title, body, date, username, comments} = payload;

    if (!id || !title || !body || !date || !username || !comments) {
      throw new Error('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (
      typeof id !== 'string' ||
      typeof title !== 'string' || 
      typeof body !== 'string' ||
      typeof date !== 'string' ||
      typeof username !== 'string' ||
      !Array.isArray(comments)
    ) {
      throw new Error('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailThread;