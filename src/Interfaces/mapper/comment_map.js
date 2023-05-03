const mapAddCommentToResponse = ({
  id,
  content,
  owner,
}) => ({
  id,
  content,
  owner,
});

const mapCommentToResponse = ({
  id,
  content,
  owner,
  created_at,
}) => {
  return {
    id,
    content,
    owner,
    date: created_at,
  };
};

module.exports = {
  mapAddCommentToResponse,
  mapCommentToResponse,
}