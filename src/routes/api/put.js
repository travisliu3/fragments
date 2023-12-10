const { createSuccessResponse } = require('../../response');
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  if (Buffer.isBuffer(req.body)) {
    try {
      logger.debug(`${req.params.id} This is id for update`);
      const fragment = await Fragment.byId(req.user, req.params.id);
      const headers = req.headers;
      if (fragment.type == headers['content-type']) {
        logger.info('fragment exists for update');
        const fragment2 = new Fragment(fragment);
        await fragment2.setData(req.body);
        logger.info('fragment data updated');
        res.status(200).json(createSuccessResponse(200, 'fragment data updated'));
      } else {
        res.status(400).json(createErrorResponse(400, `A fragment's type can not be changed`));
      }
    } catch (err) {
      res.status(404).json(createErrorResponse(404, 'No fragment found'));
    }
  } else {
    // req.body is NOT Buffer
    logger.warn('Content-Type is not supported for PUT');
    res
      .status(415)
      .json(
        createErrorResponse(
          415,
          'The Content-Type of the fragment being sent with the request is not supported'
        )
      );
  }
};
