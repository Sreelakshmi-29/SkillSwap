const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, message = 'Error occurred', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

const sendPaginated = (res, data, total, page, limit) => {
  return res.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
};

module.exports = { sendSuccess, sendError, sendPaginated };