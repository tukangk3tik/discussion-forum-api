
exports.up = (pgm) => {
  pgm.createTable('thread_comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
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
    }});
};

exports.down = (pgm) => {
  pgm.dropTable('thread_comment_likes');
};
