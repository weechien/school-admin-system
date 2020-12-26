import { Sequelize, Transaction } from 'sequelize'
import Logger from './logger'
import { ForeignKeys } from '../const/foreignKeys.const'
import { classDefiner } from '../models/class.model'
import { studentDefiner } from '../models/student.model'
import { subjectDefiner } from '../models/subject.model'
import { teacherDefiner } from '../models/teacher.model'
import { subjectClassDefiner } from '../models/subjectClass.model'
import { studentSubjectClassDefiner } from '../models/studentSubjectClass.model'
import { teacherSubjectClassDefiner } from '../models/teacherSubjectClass.model'

const {
  CLASS_FK,
  SUBJECT_FK,
  STUDENT_FK,
  TEACHER_FK,
  SUBJECT_CLASS_FK,
} = ForeignKeys

const modelDefiners = [
  classDefiner,
  studentDefiner,
  subjectDefiner,
  teacherDefiner,
  subjectClassDefiner,
  studentSubjectClassDefiner,
  teacherSubjectClassDefiner,
]

const LOG = new Logger('database.ts')
const {
  DB_HOST = 'localhost',
  DB_PORT = '33306',
  DB_SCHEMA = 'school-administration-system',
  DB_USER = 'root',
  DB_PW = 'password',
  DB_POOL_ACQUIRE = '30000',
  DB_POOL_IDLE = '10000',
  DB_POOL_MAX_CONN = '10',
  DB_POOL_MIN_CONN = '1',
  DB_LOG_LEVEL = 'info',
} = process.env

export const initDb = (dbSchema = DB_SCHEMA, logging = true) => {
  const sequelize = new Sequelize(dbSchema, DB_USER, DB_PW, {
    dialect: 'mysql',
    host: DB_HOST,
    port: parseInt(DB_PORT),
    pool: {
      acquire: parseInt(DB_POOL_ACQUIRE),
      idle: parseInt(DB_POOL_IDLE),
      max: parseInt(DB_POOL_MAX_CONN),
      min: parseInt(DB_POOL_MIN_CONN),
    },
    timezone: '+08:00',
    logging: logging
      ? msg => {
          LOG.log(DB_LOG_LEVEL, msg)
        }
      : false,
    isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
    dialectOptions: {
      multipleStatements: true,
    },
  })
  modelDefiners.forEach(model => model(sequelize))

  // Define relationships
  const {
    Class,
    Student,
    Subject,
    Teacher,
    SubjectClass,
    StudentSubjectClass,
    TeacherSubjectClass,
  } = sequelize.models

  Subject.belongsToMany(Class, {
    through: SubjectClass,
    foreignKey: SUBJECT_FK,
    otherKey: CLASS_FK,
  })
  Class.belongsToMany(Subject, {
    through: SubjectClass,
    foreignKey: CLASS_FK,
    otherKey: SUBJECT_FK,
  })
  Subject.hasMany(SubjectClass, { foreignKey: SUBJECT_FK })
  SubjectClass.belongsTo(Subject, { foreignKey: SUBJECT_FK })
  Class.hasMany(SubjectClass, { foreignKey: CLASS_FK })
  SubjectClass.belongsTo(Class, { foreignKey: CLASS_FK })

  Teacher.belongsToMany(SubjectClass, {
    through: TeacherSubjectClass,
    foreignKey: TEACHER_FK,
    otherKey: SUBJECT_CLASS_FK,
  })
  SubjectClass.belongsToMany(Teacher, {
    through: TeacherSubjectClass,
    foreignKey: SUBJECT_CLASS_FK,
    otherKey: TEACHER_FK,
  })
  Teacher.hasMany(TeacherSubjectClass, { foreignKey: TEACHER_FK })
  TeacherSubjectClass.belongsTo(Teacher, { foreignKey: TEACHER_FK })
  SubjectClass.hasMany(TeacherSubjectClass, { foreignKey: SUBJECT_CLASS_FK })
  TeacherSubjectClass.belongsTo(SubjectClass, { foreignKey: SUBJECT_CLASS_FK })

  Student.belongsToMany(SubjectClass, {
    through: StudentSubjectClass,
    foreignKey: STUDENT_FK,
    otherKey: SUBJECT_CLASS_FK,
  })
  SubjectClass.belongsToMany(Student, {
    through: StudentSubjectClass,
    foreignKey: SUBJECT_CLASS_FK,
    otherKey: STUDENT_FK,
  })
  Student.hasMany(StudentSubjectClass, { foreignKey: STUDENT_FK })
  StudentSubjectClass.belongsTo(Student, { foreignKey: STUDENT_FK })
  SubjectClass.hasMany(StudentSubjectClass, { foreignKey: SUBJECT_CLASS_FK })
  StudentSubjectClass.belongsTo(SubjectClass, { foreignKey: SUBJECT_CLASS_FK })

  return sequelize
}

export const createDb = async (dbSchema: string) => {
  let sequelize = initDb(DB_SCHEMA, false)
  await sequelize.query(`DROP DATABASE IF EXISTS ${dbSchema}`)
  await sequelize.query(`CREATE DATABASE ${dbSchema}`)
  await sequelize.close()

  sequelize = initDb(dbSchema, false)
  return sequelize
}

export const sequelize = initDb(DB_SCHEMA, false)
