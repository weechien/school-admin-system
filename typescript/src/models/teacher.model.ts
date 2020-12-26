import { Sequelize, DataTypes } from 'sequelize'
import { TableNames } from '../const/tableNames.const'

export const teacherDefiner = (sequelize: Sequelize) => {
  sequelize.define(
    TableNames.TEACHER,
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 100],
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
    },
    {
      freezeTableName: true,
      name: {
        singular: TableNames.TEACHER,
        plural: TableNames.TEACHER,
      },
    }
  )
}
