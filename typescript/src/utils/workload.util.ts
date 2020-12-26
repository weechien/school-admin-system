import { Model, QueryTypes, Sequelize, Transaction } from 'sequelize'
import { ForeignKeys } from '../const/foreignKeys.const'
import { sequelize } from '../config/database'
import { TableNames } from '../const/tableNames.const'
import { Aliases } from '../const/workload.const'

const { TEACHER_NAME, SUBJECT_CODE, SUBJECT_NAME, NUM_OF_CLASSES } = Aliases
const { TEACHER_FK, SUBJECT_FK, CLASS_FK, SUBJECT_CLASS_FK } = ForeignKeys
const { TEACHER, SUBJECT, SUBJECT_CLASS, TEACHER_SUBJECT_CLASS } = TableNames

const { Subject, SubjectClass, Teacher } = sequelize.models

interface TeacherObjVal {
  subjectCode: string
  subjectName: string
  numberOfClasses: number
}

type TeacherArrVal = TeacherObjVal[]

interface TeacherObj {
  [teacherName: string]: TeacherArrVal
}

// Parse query result to the required response body, i.e. TeacherObj
// teachersSql is an array of objects: { teacherName, subjectCode, subjectName, numberOfClasses }[]
// Each item in the array consists of a unique subjectCode for a particular teacher
export const _parseSqlWorkload = (modelObjs: Model[]) => {
  const teacherObj: TeacherObj = {}

  modelObjs.forEach(modelObj => {
    const teacherName = modelObj.get(TEACHER_NAME) as string
    const subjectCode = modelObj.get(SUBJECT_CODE) as string
    const subjectName = modelObj.get(SUBJECT_NAME) as string
    const numberOfClasses = modelObj.get(NUM_OF_CLASSES) as number
    const val = teacherObj[teacherName]

    teacherObj[teacherName] = [
      ...(val || []),
      { subjectCode, subjectName, numberOfClasses },
    ]
  })

  return teacherObj
}

// Use raw sql query to get teachers, subjects and classes
export const rawSqlQueryWorkload = async (
  txn?: Transaction
): Promise<TeacherObj> => {
  const teachersSql = await sequelize.query(
    `
    SELECT
      ${TEACHER}.name AS ${TEACHER_NAME},
      ${SUBJECT}.subjectCode AS ${SUBJECT_CODE},
      ${SUBJECT}.name AS ${SUBJECT_NAME},
      COUNT(${SUBJECT_CLASS}.classId) AS ${NUM_OF_CLASSES}
    FROM
      ${TEACHER}
      LEFT OUTER JOIN
        (
          ${TEACHER_SUBJECT_CLASS}
          INNER JOIN
            ${SUBJECT_CLASS}
            ON ${TEACHER_SUBJECT_CLASS}.${SUBJECT_CLASS_FK} = ${SUBJECT_CLASS}.id
        )
        ON ${TEACHER}.id = ${TEACHER_SUBJECT_CLASS}.${TEACHER_FK}
      LEFT OUTER JOIN
        ${SUBJECT}
        ON ${SUBJECT_CLASS}.${SUBJECT_FK} = ${SUBJECT}.id
    GROUP BY
      ${TEACHER}.name,
      ${SUBJECT}.subjectCode,
      ${SUBJECT}.name
  `,
    {
      type: QueryTypes.SELECT,
      model: Teacher,
      mapToModel: true,
      transaction: txn,
    }
  )
  if (txn) await txn.commit()

  return _parseSqlWorkload(teachersSql)
}

// Parse query result to the required response body, i.e. TeacherObj
// teachersSequelize is an array of objects: { SubjectClass[], teacherName }[]
// SubjectClass is an array of objects: { Subject }[]
// Subject is an object: { subjectCode, subjectName }
export const _parseSequelizeWorkload = (modelObjs: Model[]) => {
  const teacherObj: TeacherObj = {}

  modelObjs.forEach(modelObj => {
    const subjObj: {
      [subjCode: string]: Pick<
        TeacherObjVal,
        typeof SUBJECT_NAME | typeof NUM_OF_CLASSES
      >
    } = {}
    const subjClasses = (modelObj as any)[SUBJECT_CLASS]

    subjClasses.forEach((subjClass: any) => {
      const subjCode = subjClass[SUBJECT].get(SUBJECT_CODE) as string
      const subjName = subjClass[SUBJECT].get(SUBJECT_NAME) as string
      const val = subjObj[subjCode]

      subjObj[subjCode] = {
        ...(val || {}),
        [SUBJECT_NAME]: subjName,
        [NUM_OF_CLASSES]: val?.[NUM_OF_CLASSES] + 1 || 1,
      }
    })
    const arr = Object.entries(subjObj).map(([key, val]) => ({
      subjectCode: key,
      ...val,
    }))
    teacherObj[modelObj.get(TEACHER_NAME) as string] = arr
  })

  return teacherObj
}

// Use sequelize to get teachers, subjects and classes
export const sequelizeQueryWorkload = async (
  txn?: Transaction
): Promise<TeacherObj> => {
  const teachersSequelize = await Teacher.findAll({
    attributes: [['name', TEACHER_NAME]],
    group: ['id', `${SUBJECT_CLASS}.id`],
    transaction: txn,
    include: [
      {
        model: SubjectClass,
        through: {
          attributes: [],
        },
        attributes: [
          [Sequelize.fn('COUNT', Sequelize.col(CLASS_FK)), NUM_OF_CLASSES],
        ],
        include: [
          {
            model: Subject,
            attributes: [
              ['subjectCode', SUBJECT_CODE],
              ['name', SUBJECT_NAME],
            ],
          },
        ],
      },
    ],
  })
  if (txn) await txn.commit()

  return _parseSequelizeWorkload(teachersSequelize)
}
