"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("equipos", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.SMALLINT,
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      escudo_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      descripcion: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      categoria: {
        type: Sequelize.ENUM('Sub-13','Sub-15','Sub-17','Sub-20'),
        allowNull:true,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("equipos");
  },
};
