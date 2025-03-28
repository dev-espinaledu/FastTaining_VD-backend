//Listo
"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_roles_3" AS ENUM ('admin','entrenador','jugador');
      `)
    
    await queryInterface.createTable("roles", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.SMALLINT,
      },
      nombre: {
        type: Sequelize.ENUM("admin", "entrenador", "jugador"),
        allowNull:false,
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
    await queryInterface.dropTable("roles");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_roles_3";',
    );
    await queryInterface.dropTable("roles");
  },
};
