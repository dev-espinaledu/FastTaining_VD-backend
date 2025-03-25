"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("jugadores", {
      fields: ["id"],
      type: "foreign key",
      name: "fk_jugadores_personas",
      references: {
        table: "personas",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("entrenadores", {
      fields: ["id"],
      type: "foreign key",
      name: "fk_entrenadores_personas",
      references: {
        table: "personas",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("jugadores", "fk_jugadores_personas");
    await queryInterface.removeConstraint("entrenadores", "fk_entrenadores_personas");
  },
};

