const { createSuccessResponse } = require('../../response');
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const MarkdownIt = require('markdown-it');
const path = require('path');
/**
 * Get a list of fragments for the current user
 */
const logger = require('../../logger');

module.exports = async (req, res) => {
  logger.info('v1/fragments GET route works');
  if (req.query.expand) {
    // GET /fragments?expand=1
    logger.info('GET /fragments?expand=1');
    res
      .status(200)
      .json(
        createSuccessResponse({ fragments: await Fragment.byUser(req.user, req.query.expand) })
      );
  } else if (req.params.id) {
    // GET /fragments/:id
    try {
      if (req.path == `/fragments/${req.params.id}/info`) {
        logger.info(await Fragment.byId(req.user, req.params.id), 'GET /fragments/:id/info');
        res
          .status(200)
          .json(createSuccessResponse({ fragment: await Fragment.byId(req.user, req.params.id) }));
      } else {
        logger.info('GET /fragments/:id');
        const fileExtension = path.extname(req.path);

        const fragment2 = await Fragment.byId(req.user, req.params.id.replace(/\..+$/, ''));
        const fragment = new Fragment(fragment2);
        res.type(fragment.type);
        logger.info(fragment.type, 'Setting content-type');
        const data = (await fragment.getData()).toString();
        if (fileExtension == '.html') {
          logger.info(fileExtension, 'url .ext');
          const md = new MarkdownIt();
          const markdownText = md.render(data);
          const html = md.render(markdownText);
          res.status(200).send(html);
        } else if (data) {
          logger.debug('Content-Type - text/plain');
          res.status(200).send(data);
        } else {
          res
            .status(415)
            .json(
              createErrorResponse(
                415,
                'The Content-Type of the fragment being sent with the request is not supported'
              )
            );
        }
      }
    } catch (err) {
      res.status(404).json(createErrorResponse(404, 'No fragment found'));
    }
  } else {
    // GET /fragments
    logger.info('GET /fragments');
    res.status(200).json(createSuccessResponse({ fragments: await Fragment.byUser(req.user) }));
  }
};
