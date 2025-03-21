"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("jugadores", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.SMALLINT,
      },
      fecha_nacimiento: {
        type: Sequelize.DATE,
      },
      altura: {
        type: Sequelize.SMALLINT,
      },
      peso: {
        type: Sequelize.STRING,
      },
      posicion: {
        type: Sequelize.ENUM("delantero", "mediocampista", "defensa", "arquero"),
      },
      porcentaje_grasa_corporal: {
        type: Sequelize.DOUBLE,
      },
      porcentaje_masa_muscular: {
        type: Sequelize.DOUBLE,
      },
      tipo_cuerpo: {
        type: Sequelize.STRING,
      },
      fuerza: {
        type: Sequelize.SMALLINT,
      },
      velocidad_max: {
        type: Sequelize.SMALLINT,
      },
      resistencia: {
        type: Sequelize.SMALLINT,
      },
      resistencia_cardiovascular: {
        type: Sequelize.SMALLINT,
      },
      resistencia_muscular: {
        type: Sequelize.SMALLINT,
      },
      flexibilidad: {
        type: Sequelize.DOUBLE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("jugadores");
  },
};
