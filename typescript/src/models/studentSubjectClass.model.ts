import { DataTypes, Sequelize } from 'sequelize'
import { TableNames } from '../const/tableNames.const'

export const studentSubjectClassDefiner = (sequelize: Sequelize) => {
  sequelize.define(
    TableNames.STUDENT_SUBJECT_CLASS,
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
        singular: TableNames.STUDENT_SUBJECT_CLASS,
        plural: TableNames.STUDENT_SUBJECT_CLASS,
      },
    }
  )
}
