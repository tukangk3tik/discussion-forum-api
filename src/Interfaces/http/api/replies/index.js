const RepliesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'replies',
  register: async (server, { container }) => {
    const replyHandler = new RepliesHandler(container);
    server.route(routes(replyHandler));
  },
};
