const { createSuccessResponse } = require('../../response');
/**
 * Get a list of fragments for the current user
 */
const logger = require('../../logger');

module.exports = (req, res) => {
  logger.info('v1/fragments GET route works');
  res.status(200).json(createSuccessResponse({ fragments: [] }));
};
