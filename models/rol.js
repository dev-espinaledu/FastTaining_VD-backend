//En revisión 
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Rol extends Model {
    static associate(models) {
      
      this.hasOne(models.Usuario, {
        foreignKey: "rol_id",
        as: "usuarios",
        onDelete: "SET NULL", // Si se elimina el rol, el usuario mantiene la clave nula
        onUpdate: "CASCADE",
      });

      this.belongsToMany(models.Permiso,{
        through: "roles_permisos",
        foreignKey:"rol_id",
        otherKey:" permiso_id",
        as:"permisos"
      }); 
    }
  }
  Rol.init(
    {
      nombre: DataTypes.ENUM("admin", "jugador", "entrenador"),
    },
    {
      sequelize,
      modelName: "Rol",
      tableName: "roles",
    },
  );
  return Rol;
};
