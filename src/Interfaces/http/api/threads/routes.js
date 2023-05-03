const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadsHandler,
    options: {
      auth: 'auth_jwt',
    },
  },
]);

module.exports = routes;
