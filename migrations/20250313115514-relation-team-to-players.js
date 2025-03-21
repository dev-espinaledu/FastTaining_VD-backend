"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("jugadores", "equipo_id", {
      type: Sequelize.SMALLINT,
      references: {
        model: "equipos",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL", // Si se elimina el equipo, el jugador queda sin equipo
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("jugadores", "equipo_id");
  },
};
