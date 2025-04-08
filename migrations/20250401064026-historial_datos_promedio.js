'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("promedio_datos", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.SMALLINT,
      },
      equipo_id:{
        type:Sequelize.SMALLINT,
        allowNull: false,
        references:{model:"equipos", key:"id"},        
      },
      fecha_registro:{
        allowNull:true,
        type: Sequelize.DATE
      },
      altura_prom: {
        type: Sequelize.DOUBLE,
        allowNull:true
      },
      peso_prom: {
        type: Sequelize.STRING,
        allowNull:true
      },
      grasa_corporal_prom: {
        type: Sequelize.DOUBLE,
        allowNull:true
      },
      masa_muscular_prom: {
        type: Sequelize.DOUBLE,
        allowNull:true
      }, 
      potencia_muscular_prom: {
        type: Sequelize.DOUBLE,
        allowNull:true
      },
      velocidad_prom: {
        type: Sequelize.DOUBLE,
        allowNull:true
      },
      resistencia_aerobica_prom: {
        type: Sequelize.DOUBLE,
        allowNull:true
      },
      resistencia_anaerobica_prom: {
        type: Sequelize.DOUBLE,
        allowNull:true
      },
      flexibilidad_prom: {
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
    await queryInterface.dropTable("promedio_datos");
  },
};
