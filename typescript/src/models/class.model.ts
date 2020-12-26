import { Sequelize, DataTypes } from 'sequelize'
import { TableNames } from '../const/tableNames.const'

export const classDefiner = (sequelize: Sequelize) =>
  sequelize.define(
    TableNames.CLASS,
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 100],
        },
      },
      classCode: {
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
        singular: TableNames.CLASS,
        plural: TableNames.CLASS,
      },
    }
  )
