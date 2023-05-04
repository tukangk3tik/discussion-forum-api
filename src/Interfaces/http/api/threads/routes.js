const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadsHandler,
    options: {
      auth: 'auth_jwt',
    },
  },
  {
    method: 'GET',
    path: '/threads/{id}',
    handler: handler.getThreadByIdHandler,
  },
]);

module.exports = routes;
