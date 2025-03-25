'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("roles_permisos", {
      rol_id: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        references: { model: "roles", key: "id" },
        onDelete: "CASCADE",
      },
      permiso_id: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        references: { model: "permisos", key: "id" },
        onDelete: "CASCADE",
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
    await queryInterface.dropTable("roles_permisos");
  },
};
