import { Sequelize, DataTypes } from 'sequelize'
import { TableNames } from '../const/tableNames.const'

export const subjectDefiner = (sequelize: Sequelize) => {
  sequelize.define(
    TableNames.SUBJECT,
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 100],
        },
      },
      subjectCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [2, 100],
        },
      },
    },
    {
      freezeTableName: true,
      name: {
        singular: TableNames.SUBJECT,
        plural: TableNames.SUBJECT,
      },
    }
  )
}
