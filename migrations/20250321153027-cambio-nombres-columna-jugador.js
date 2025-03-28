'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('jugadores', 'porcentaje_grasa_muscular', 'porcentaje_masa_muscular');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('jugadores', 'porcentaje_masa_muscular', 'porcentaje_grasa_muscular');
  }
};
