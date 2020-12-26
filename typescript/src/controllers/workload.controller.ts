import { RequestHandler } from 'express'
import { Transaction } from 'sequelize'
import { SeqRequest } from '../utils/types.util'
import { asyncHandler } from '../middlewares/async.middleware'
import {
  rawSqlQueryWorkload,
  sequelizeQueryWorkload,
} from '../utils/workload.util'

/**
 * Get a list of teacher names together with the subjects they teach and number of classes for each subject
 * @route GET /api/reports/workload
 */
export const workloadHandler: RequestHandler = asyncHandler(
  async (req: SeqRequest, res) => {
    let txn: Transaction

    try {
      txn = await req.sequelize.transaction()

      // Query using either raw sql query or sequelize query, both has its pros and cons
      // Raw sql query:
      //   Pros - Result is faster and easier to parse as GROUP BY works properly
      //   Cons - Raw query is harder to read and maintain
      // Sequelize query:
      //   Pros - No need to deal with raw queries
      //   Cons - Using GROUP BY has no effect when joining tables as the primary key of the joined table must be included
      //        - Result is harder to parse
      const teacherObj = await rawSqlQueryWorkload(txn)
      // const teacherObj = await sequelizeQuery(transaction)

      res.status(200).json(teacherObj)
    } catch (e) {
      if (txn) await txn.rollback()
      throw e
    }
  }
)
