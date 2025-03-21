module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("jugadores", "persona_id", {
      type: Sequelize.INTEGER,
      allowNull: true, // Cambia a `true` si puede ser opcional
      references: {
        model: "personas",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("jugadores", "persona_id");
  },
};
