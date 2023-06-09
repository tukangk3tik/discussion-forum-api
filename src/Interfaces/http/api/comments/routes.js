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
    path: '/threads/{threadId}/comments/{commentId}',
    handler: handler.deleteCommentHandler,
    options: {
      auth: 'auth_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/threads/{threadId}/comments/{commentId}/likes',
    handler: handler.likeOrUnlikeCommentHandler,
    options: {
      auth: 'auth_jwt',
    },
  },
]);

module.exports = routes;
