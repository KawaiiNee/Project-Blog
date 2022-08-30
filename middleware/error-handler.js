const { StatusCodes } = require("http-status-codes");

const errorHandlerMiddleware = (err, req, res, end) => {
  alert(err);
  console.log(err);
  let customError = {
    statusCode: err.sttatusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || `Something went wrong`,
  };

  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
