
exports.up = (pgm) => {
  pgm.createTable('threads', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'VARCHAR(150)',
      notNull: true,
    },
    body: {
      type: 'TEXT',
      notNull: true,
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
    }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('threads');
};
