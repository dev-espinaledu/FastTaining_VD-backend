"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("jugadores", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.SMALLINT,
      },
      usuario_id:{
        type:Sequelize.SMALLINT,
        allowNull: false,
        references:{model:"usuarios", key:"id"},
      },
      equipo_id:{
        type:Sequelize.SMALLINT,
        allowNull: false,
        references:{model:"equipos", key:"id"},        
      },
      fecha_nacimiento: {
        type: Sequelize.DATE,
      },
      altura: {
        type: Sequelize.DOUBLE,
        allowNull:true
      },
      peso: {
        type: Sequelize.DOUBLE,
        allowNull:true
      },
      posicion: {
        type: Sequelize.ENUM("delantero", "mediocampista", "defensa", "arquero"),
      },
      porcentaje_grasa_corporal: {
        type: Sequelize.DOUBLE,
        allowNull:true
      },
      porcentaje_masa_muscular: {
        type: Sequelize.DOUBLE,
        allowNull:true
      }, 
      tipo_cuerpo: {
        type: Sequelize.STRING,
        allowNull:true
      },
      potencia_muscular_piernas: {
        type: Sequelize.DOUBLE,
        allowNull:true
      },
      velocidad_max: {
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
    await queryInterface.dropTable("jugadores");
  },
};
