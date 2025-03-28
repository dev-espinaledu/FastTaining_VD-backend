//Listo
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Token extends Model {
    static associate(models) {
      this.belongsTo(models.Usuario,{
        foreignKey:"usuario_id",
        as:"usuarios"
      }); 
    }
  }
  Token.init(
    {
      usuario_id: DataTypes.SMALLINT,
      reset_token:DataTypes.STRING
    },
    {
      sequelize,
      modelName: "Token",
      tableName: "password_resets",
    },
  );
  return Token;

};
