import { BulkCreateOptions, Model, ModelCtor, Transaction, Op } from 'sequelize'
import { ForeignKeys } from '../const/foreignKeys.const'
import { TableUidKey } from '../const/tableUid.const'
import { sequelize } from '../config/database'
import { RegisterBody } from '../controllers/register.controller'
import ErrorBase from '../errors/errorBase.error'

const {
  CLASS_FK,
  SUBJECT_FK,
  STUDENT_FK,
  TEACHER_FK,
  SUBJECT_CLASS_FK,
} = ForeignKeys

const {
  CLASS_UID_KEY,
  SUBJECT_UID_KEY,
  STUDENT_UID_KEY,
  TEACHER_UID_KEY,
} = TableUidKey

const {
  Class,
  Student,
  Subject,
  Teacher,
  SubjectClass,
  TeacherSubjectClass,
  StudentSubjectClass,
} = sequelize.models

// Get all objects from a model with options
export const _getModels = async (
  model: ModelCtor<Model>,
  options?: Parameters<typeof model.findAll>[0]
) => await model.findAll(options)

// Upsert a list of objects of a model with options
export const _upsertModels = async (
  model: ModelCtor<Model>,
  reqBody: { [key: string]: any } | { [key: string]: any }[],
  updateOnDuplicate?: BulkCreateOptions['updateOnDuplicate'],
  txn?: BulkCreateOptions['transaction']
) => {
  const body = Array.isArray(reqBody) ? reqBody : [reqBody]
  return await model.bulkCreate(body, {
    validate: true,
    updateOnDuplicate,
    transaction: txn,
  })
}

// Return a list of objects specifying their uid filters
export const _mapUidFilters = (modelObjs: Model[], uidKey: string | string[]) =>
  modelObjs.map(modelObj => {
    if (typeof uidKey === 'string') {
      return { [uidKey]: String(modelObj.get(uidKey)) }
    } else {
      return {
        [Op.and]: uidKey.map(key => ({ [key]: String(modelObj.get(key)) })),
      }
    }
  })

// Get the ids of objects using their unique ids, e.g. email
export const _fetchIdFromUid = async (
  Model: ModelCtor<Model>,
  uidFilters: { [key: string]: string }[],
  txn?: Transaction
) => {
  if (!uidFilters.length) return []

  const modelObjs = await _getModels(Model, {
    attributes: ['id'],
    where: { [Op.or]: uidFilters },
    transaction: txn,
  })
  return modelObjs.map(modelObj => modelObj.get('id')) as number[]
}

// Merge 2 lists of foreign key ids into a single list
// input: [{fk1: 1}], [{fk2: 1}]
// output: [{fk1: 1, fk2: 1}]
export const _mergeFkIds = (
  idArr1: { [key: string]: number }[],
  idArr2: { [key: string]: number }[]
) => {
  const mergeArr: { [key: string]: number }[] = []

  idArr1.forEach(id1 =>
    idArr2.forEach(id2 => mergeArr.push({ ...id1, ...id2 }))
  )
  return mergeArr
}

// Build a list of objects of a particular model containing the foreign key as key and id as value
export const _buildFkIds = async (
  model: ModelCtor<Model>,
  modelObjs: Model[],
  uidKey: Parameters<typeof _mapUidFilters>[1],
  foreignKey: string,
  txn?: Transaction
) => {
  const uidObjArr = _mapUidFilters(modelObjs, uidKey)
  const fetchedIdArr = await _fetchIdFromUid(model, uidObjArr, txn)

  return fetchedIdArr.map(id => ({ [foreignKey]: id }))
}

// Make sure required input fields are not empty and have no duplicate uids, else throw a 400 error
export const _checkInputBody = (regBody: RegisterBody) => {
  const {
    class: classBody,
    students: studentsBody,
    subject: subjectBody,
    teacher: teacherBody,
  } = regBody
  const bodyArr = Object.entries(regBody)

  if (bodyArr.length !== 4)
    throw new ErrorBase('All input fields are mandatory.', 400, 400)

  bodyArr.forEach(([key, body]) => {
    let uidKey: string

    switch (key) {
      case 'class':
        uidKey = CLASS_UID_KEY
        break
      case 'students':
        uidKey = STUDENT_UID_KEY
        break
      case 'subject':
        uidKey = SUBJECT_UID_KEY
        break
      case 'teacher':
        uidKey = TEACHER_UID_KEY
        break
    }

    if (Array.isArray(body)) {
      const uids = body.map(uid => uid[uidKey])
      const uidSet = new Set(uids)

      if (uidSet.size !== body.length)
        throw new ErrorBase(`Duplicate ${key} ${uidKey} found`, 400, 400)
    }
  })

  return { classBody, studentsBody, subjectBody, teacherBody }
}

// Get input (class, student, subject and teacher) from the request body and upsert the base models
// Get the ids of the base models and upsert the junction tables (subjectClass, teacherSubjectClass and studentSubjectClass)
export const sequelizeQueryRegister = async (
  regBody: RegisterBody,
  txn?: Transaction
): Promise<void> => {
  const { classBody, studentsBody, subjectBody, teacherBody } = _checkInputBody(
    regBody
  )

  // Update or create objects
  const classes = await _upsertModels(Class, classBody, ['name'], txn)
  const students = await _upsertModels(Student, studentsBody, ['name'], txn)
  const subjects = await _upsertModels(Subject, subjectBody, ['name'], txn)
  const teachers = await _upsertModels(Teacher, teacherBody, ['name'], txn)

  // Find all ids using their uid
  // Map an array of objects with the foreign key as key and id as value
  const classIds = await _buildFkIds(
    Class,
    classes,
    CLASS_UID_KEY,
    CLASS_FK,
    txn
  )
  const studentIds = await _buildFkIds(
    Student,
    students,
    STUDENT_UID_KEY,
    STUDENT_FK,
    txn
  )
  const subjectIds = await _buildFkIds(
    Subject,
    subjects,
    SUBJECT_UID_KEY,
    SUBJECT_FK,
    txn
  )
  const teacherIds = await _buildFkIds(
    Teacher,
    teachers,
    TEACHER_UID_KEY,
    TEACHER_FK,
    txn
  )

  // Update SubjectClass junction table
  // Build the foreign key ids of SubjectClass
  const mergedSubjectClasses = _mergeFkIds(subjectIds, classIds)
  const subjectClasses = await _upsertModels(
    SubjectClass,
    mergedSubjectClasses,
    [SUBJECT_FK, CLASS_FK],
    txn
  )
  const subjectClassIds = await _buildFkIds(
    SubjectClass,
    subjectClasses,
    [SUBJECT_FK, CLASS_FK],
    SUBJECT_CLASS_FK,
    txn
  )

  // Merge the built foreign key ids from SubjectClass together with Student and Teacher
  // Update the junction tables
  const mergedStudentSubjectClass = _mergeFkIds(studentIds, subjectClassIds)
  const mergedTeacherSubjectClass = _mergeFkIds(teacherIds, subjectClassIds)

  await _upsertModels(
    StudentSubjectClass,
    mergedStudentSubjectClass,
    [STUDENT_FK, SUBJECT_CLASS_FK],
    txn
  )
  await _upsertModels(
    TeacherSubjectClass,
    mergedTeacherSubjectClass,
    [TEACHER_FK, SUBJECT_CLASS_FK],
    txn
  )

  if (txn) await txn.commit()
}
