//err 

export function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
}

export function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join('; ') || message;
  }
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  }
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', err);
  }
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}
