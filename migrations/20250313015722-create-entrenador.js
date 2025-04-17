"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("entrenadores", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.SMALLINT,
      },
      usuario_id: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "id",
        },
      },
      equipo_id: {
        type: Sequelize.SMALLINT,
        allowNull: true,
        references: {
          model: "equipos",
          key: "id",
        },
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
    await queryInterface.dropTable("entrenadores");
  },
};
