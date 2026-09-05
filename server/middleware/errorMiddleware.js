const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : null);

  if (!statusCode) {
    const msg = err.message || '';
    if (
      msg.includes('Invalid email or password') ||
      msg.includes('inactive') ||
      msg.includes('Authentication') ||
      msg.includes('No token')
    ) {
      statusCode = 401;
    } else if (
      msg.includes('permission') ||
      msg.includes('forbidden') ||
      msg.includes('Unauthorized role')
    ) {
      statusCode = 403;
    } else if (err.name === 'ValidationError' || msg.includes('Validation') || msg.includes('required')) {
      statusCode = 400;
    } else if (err.code === 11000 || msg.includes('duplicate') || msg.includes('already exists')) {
      statusCode = 409;
    } else {
      statusCode = 500;
    }
  }

  res.status(statusCode);

  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || []
  };

  if (process.env.SHOW_STACK === 'true' || process.env.DEBUG_STACK === '1') {
    response.stack = err.stack;
  }

  res.json(response);
};

module.exports = { notFound, errorHandler };
