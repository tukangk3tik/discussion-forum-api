
exports.up = (pgm) => {
  pgm.createTable('thread_comment_replies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"thread_comments"',
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
    },
    created_at: {
      type: 'datetime',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    deleted_at: {
      type: 'datetime',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('thread_comment_replies');
};
