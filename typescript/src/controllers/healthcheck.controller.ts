import { RequestHandler } from 'express'
import { OK } from 'http-status-codes'
import { asyncHandler } from '../middlewares/async.middleware'

export const healthcheckHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    return res.sendStatus(OK)
  }
)
