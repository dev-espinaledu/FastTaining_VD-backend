'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('datos_sesion', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.SMALLINT
      },
      equipo_id:{
        type: Sequelize.SMALLINT,
        allowNull: false,
        references: { model: "equipos", key: "equipo_id" },
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false
      },
      objetivo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      altura: {
        type: Sequelize.DOUBLE,
        allowNull:true
      },
      peso: {
        type: Sequelize.STRING,
        allowNull:true
      },
      grasa_corporal: {
        type: Sequelize.DOUBLE,
        allowNull:true
      },
      masa_muscular: {
        type: Sequelize.DOUBLE,
        allowNull:true
      }, 
      potencia_muscular: {
        type: Sequelize.DOUBLE,
        allowNull:true
      },
      velocidad: {
        type: Sequelize.DOUBLE,
        allowNull:true
      },
      resistencia_aerobica: {
        type: Sequelize.DOUBLE,
        allowNull:true
      },
      resistencia_anaerobica: {
        type: Sequelize.DOUBLE,
        allowNull:true
      },
      flexibilidad: {
        type: Sequelize.DOUBLE,
      },
      nombre_sesion:{
        type: Sequelize.STRING,
      },
    
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('datos_sesion');
  }
};