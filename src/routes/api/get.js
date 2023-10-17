const { createSuccessResponse } = require('../../response');
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
    logger.info('Inside req.query route');
    res
      .status(200)
      .json(
        createSuccessResponse({ fragments: await Fragment.byUser(req.user, req.query.expand) })
      );
  } else if (req.params.id) {
    logger.info('Inside req.params route');
    logger.info(req.path);
    if (req.path == `/fragments/${req.params.id}/info`) {
      res
        .status(200)
        .json(createSuccessResponse({ fragment: await Fragment.byId(req.user, req.params.id) }));
    } else {
      const fileExtension = path.extname(req.path);

      const fragment2 = await Fragment.byId(req.user, req.params.id.replace(/\..+$/, ''));
      const data = (await fragment2.getData()).toString();
      if (fileExtension == '.html') {
        logger.info(fileExtension, 'url .ext');
        const md = new MarkdownIt();
        const markdownText = md.render(data);
        const html = md.render(markdownText);
        res.status(200).json(html);
      } else {
        res.status(200).json(data);
      }
    }
  } else {
    res.status(200).json(createSuccessResponse({ fragments: await Fragment.byUser(req.user) }));
  }
};
