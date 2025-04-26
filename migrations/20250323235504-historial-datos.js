'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("historial_datos", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.SMALLINT,
      },
      jugador_id:{
        type:Sequelize.SMALLINT,
        allowNull: false,
        references:{model:"jugadores", key:"id"},
      },
      fecha_registro: {
        type: Sequelize.DATE,
        allowNull:false
      },
      altura: {
        type: Sequelize.SMALLINT,
        allowNull:true
      },
      peso: {
        type: Sequelize.STRING,
        allowNull:true
      },
      porcentaje_grasa_corporal: {
        type: Sequelize.DOUBLE,
        allowNull:true
      },
      porcentaje_masa_muscular: {
        type: Sequelize.DOUBLE,
        allowNull:true
      }, 
      potencia_muscular_piernas: {
        type: Sequelize.SMALLINT,
        allowNull:true
      },
      velocidad_max: {
        type: Sequelize.SMALLINT,
        allowNull:true
      },
      resistencia_aerobica: {
        type: Sequelize.SMALLINT,
        allowNull:true
      },
      resistencia_anaerobica: {
        type: Sequelize.SMALLINT,
        allowNull:true
      },
      flexibilidad: {
        type: Sequelize.DOUBLE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('historial_datos'); 
  }
};