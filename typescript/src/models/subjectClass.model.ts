import { DataTypes, Sequelize } from 'sequelize'
import { TableNames } from '../const/tableNames.const'

export const subjectClassDefiner = (sequelize: Sequelize) => {
  sequelize.define(
    TableNames.SUBJECT_CLASS,
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
        singular: TableNames.SUBJECT_CLASS,
        plural: TableNames.SUBJECT_CLASS,
      },
    }
  )
}
