const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads/{id}/comments',
    handler: handler.postCommentHandler,
    options: {
      auth: 'auth_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{thread_id}/comments/{comment_id}',
    handler: handler.deleteCommentHandler,
    options: {
      auth: 'auth_jwt',
    },
  },
]);

module.exports = routes;
