const { createSuccessResponse } = require('../../response');
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  logger.info('v1/fragments DELETE route works');
  const fragment = await Fragment().byId(req.user, req.params.id);
  if (fragment) {
    Fragment().delete(req.user, req.params.id);
    res.status(200).json(createSuccessResponse());
  } else {
    res.status(404).json(createErrorResponse(404, 'fragment not found'));
  }
};
