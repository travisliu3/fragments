const { createSuccessResponse } = require('../../response');
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = (req, res) => {
  if (Buffer.isBuffer(req.body)) {
    // Get the headers from the request
    const headers = req.headers;
    // Access specific header properties
    const contentType = headers['content-type'];
    let fragmentData = new Fragment({
      ownerId: req.user,
      type: contentType,
      size: req.body.length,
    });
    const host = process.env.API_URL || req.headers.host;
    // ADD Location header
    res.header('Access-Control-Expose-Headers', 'location');
    res.location(host + `/v1/fragments/${fragmentData.id}`);

    res.status(201).json(createSuccessResponse({ fragment: fragmentData }));
  }
  res
    .status(415)
    .json(
      createErrorResponse(
        415,
        'The Content-Type of the fragment being sent with the request is not supported'
      )
    );
};
