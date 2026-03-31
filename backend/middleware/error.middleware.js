const errorMiddleware = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  // Oracle-specific errors
  if (err.errorNum) {
    // ORA-00001: unique constraint violated
    if (err.errorNum === 1) {
      return res.status(409).json({
        success: false,
        message: 'A record with this data already exists.',
      });
    }
    // ORA-02291: integrity constraint violated - parent key not found
    if (err.errorNum === 2291) {
      return res.status(400).json({
        success: false,
        message: 'Referenced record not found.',
      });
    }
    // ORA-20001: custom application error
    if (err.errorNum === 20001) {
      return res.status(400).json({
        success: false,
        message: err.message.split('\n')[0].replace(/^ORA-\d+:\s*/, ''),
      });
    }
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
};

module.exports = errorMiddleware;
