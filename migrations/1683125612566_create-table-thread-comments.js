exports.up = (pgm) => {
  pgm.createTable('thread_comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"threads"',
    },
    replies_parent: {
      type: 'VARCHAR(50)',
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
    },
    deleted_at: {
      type: 'datetime',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('thread_comments');
};
