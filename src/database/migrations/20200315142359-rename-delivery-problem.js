module.exports = {
  up: queryInterface => {
    return queryInterface.renameTable('delivery_problems', 'problems');
  },

  down: queryInterface => {
    return queryInterface.renameTable('problems', 'delivery_problems');
  },
};
