import { Sequelize, DataTypes } from 'sequelize'
import { TableNames } from '../const/tableNames.const'

export const teacherSubjectClassDefiner = (sequelize: Sequelize) => {
  sequelize.define(
    TableNames.TEACHER_SUBJECT_CLASS,
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      name: {
        singular: TableNames.TEACHER_SUBJECT_CLASS,
        plural: TableNames.TEACHER_SUBJECT_CLASS,
      },
    }
  )
}
