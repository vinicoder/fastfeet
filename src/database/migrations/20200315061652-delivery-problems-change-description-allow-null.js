module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('delivery_problems', 'description', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
