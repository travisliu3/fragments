const { createSuccessResponse } = require('../../response');
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const MarkdownIt = require('markdown-it');
const path = require('path');
const { JSDOM } = require('jsdom');
const sharp = require('sharp');
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
        const resData = extHandler(fileExtension, data, fragment.type);
        if (resData) {
          res.status(200).send(resData);
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

function extHandler(fileExtension, data, type) {
  if (fileExtension != '') {
    if (type.includes('text/plain')) {
      if (fileExtension != '.txt') {
        return 0;
      } else {
        return data;
      }
    } else if (type.includes('text/markdown')) {
      logger.info(fileExtension, 'url .ext');
      const md = new MarkdownIt();
      const html = md.render(data);
      if (fileExtension == '.html') {
        return html;
      } else if (fileExtension == '.txt') {
        const plainText = html.replace(/<[^>]*>/g, '');
        return plainText;
      } else if (fileExtension == '.md') {
        return data;
      } else {
        return 0;
      }
    } else if (type.includes('text/html')) {
      if (fileExtension == '.txt') {
        // Create a new JSDOM instance
        const dom = new JSDOM(data);

        // Access the document property of the JSDOM instance
        const doc = dom.window.document;

        // Extract text content from the DOM
        const textContent = doc.body.textContent || '';

        // Trim leading and trailing white spaces
        return textContent.trim();
      } else if (fileExtension == '.html') {
        return data;
      } else {
        return 0;
      }
    } else if (type.includes('application/json')) {
      if (fileExtension == '.txt') {
        // Use JSON.stringify to convert the JSON object to a string
        var jsonString = JSON.stringify(data);

        // Remove quotes around the string
        var plainText = jsonString.slice(1, -1);

        return plainText;
      } else if (fileExtension == '.json') {
        return data;
      } else {
        return 0;
      }
    } else if (type.includes('image/png')) {
      if (fileExtension == '.jpg') {
        return sharp(data).jpeg({ quality: 80 }).toBuffer();
      } else if (fileExtension == '.webp') {
        return sharp(data).webp({ quality: 80 }).toBuffer();
      } else if (fileExtension == '.gif') {
        return sharp(data).gif({ quality: 80 }).toBuffer();
      } else if (fileExtension == '.png') {
        return data;
      } else {
        return 0;
      }
    } else if (type.includes('image/jpeg')) {
      if (fileExtension == '.jpg') {
        return data;
      } else if (fileExtension == '.webp') {
        return sharp(data).webp({ quality: 80 }).toBuffer();
      } else if (fileExtension == '.gif') {
        return sharp(data).gif({ quality: 80 }).toBuffer();
      } else if (fileExtension == '.png') {
        return sharp(data).png({ quality: 80 }).toBuffer();
      } else {
        return 0;
      }
    } else if (type.includes('image/webp')) {
      if (fileExtension == '.jpg') {
        return sharp(data).jpeg({ quality: 80 }).toBuffer();
      } else if (fileExtension == '.webp') {
        return data;
      } else if (fileExtension == '.gif') {
        return sharp(data).gif({ quality: 80 }).toBuffer();
      } else if (fileExtension == '.png') {
        return sharp(data).png({ quality: 80 }).toBuffer();
      } else {
        return 0;
      }
    } else if (type.includes('image/gif')) {
      if (fileExtension == '.jpg') {
        return sharp(data).jpeg({ quality: 80 }).toBuffer();
      } else if (fileExtension == '.webp') {
        return sharp(data).gif({ quality: 80 }).toBuffer();
      } else if (fileExtension == '.gif') {
        return data;
      } else if (fileExtension == '.png') {
        return sharp(data).png({ quality: 80 }).toBuffer();
      } else {
        return 0;
      }
    }
  } else {
    return data;
  }
}
