import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'http-status-codes'
import ErrorCodes from '../const/errorCodes.const'
import ErrorBase from '../errors/errorBase.error'
import { ErrorRequestHandler } from 'express'
import { BaseError, AggregateError, ValidationError } from 'sequelize'

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  if (res.headersSent) {
    return next(err)
  }

  // Handling of body-parser content malformed error
  if (err.type === 'entity.parse.failed') {
    return res.status(BAD_REQUEST).send({
      errorCode: ErrorCodes.MALFORMED_JSON_ERROR_CODE,
      message: 'Malformed json',
    })
  }

  if (err instanceof ErrorBase) {
    const error = err

    return res.status(error.getHttpStatusCode()).send({
      errorCode: error.getErrorCode(),
      message: error.getMessage(),
    })
  } else if (err instanceof BaseError) {
    let messages: string[] = []

    if (err instanceof AggregateError) {
      messages = err.errors.map(error => error.message)
    } else if (err instanceof ValidationError) {
      messages = err.errors.map(error => error.message)
    } else {
      messages = [err.message]
    }

    return res.status(400).send({
      errorCode: 400,
      message: messages,
    })
  } else {
    return res.status(INTERNAL_SERVER_ERROR).send({
      errorCode: ErrorCodes.RUNTIME_ERROR_CODE,
      message: 'Internal Server Error',
    })
  }
}
