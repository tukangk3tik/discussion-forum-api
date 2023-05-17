class NewThread {
  constructor(payload) {
    this._verifyPayload(payload);

    this.title = payload.title;
    this.body = payload.body;
  }

  _verifyPayload(payload) {
    const {title, body} = payload;

    if (!title || !body) {
      throw new Error('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (title.length > 150) {
      throw new Error('NEW_THREAD.TITLE_LIMIT_CHAR');
    }

    if (
      typeof title !== 'string' ||
      typeof body !== 'string'
    ) {
      throw new Error('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewThread;
