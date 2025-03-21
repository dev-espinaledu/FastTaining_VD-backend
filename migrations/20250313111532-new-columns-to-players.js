"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("jugadores", "frecuencia_cardiaca", {
      type: Sequelize.SMALLINT,
    });
    await queryInterface.addColumn("jugadores", "peso", {
      type: Sequelize.FLOAT,
    });
    await queryInterface.addColumn("jugadores", "resistencia", {
      type: Sequelize.SMALLINT,
    });
    await queryInterface.addColumn("jugadores", "fuerza", {
      type: Sequelize.SMALLINT,
    });
    await queryInterface.addColumn("jugadores", "velocidad", {
      type: Sequelize.SMALLINT,
    });
    await queryInterface.addColumn("jugadores", "potencia", {
      type: Sequelize.SMALLINT,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("jugadores", "frecuencia_cardiaca");
    await queryInterface.removeColumn("jugadores", "peso");
    await queryInterface.removeColumn("jugadores", "resistencia");
    await queryInterface.removeColumn("jugadores", "fuerza");
    await queryInterface.removeColumn("jugadores", "velocidad");
    await queryInterface.removeColumn("jugadores", "potencia");
  },
};
