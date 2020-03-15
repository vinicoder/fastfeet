module.exports = {
  up: queryInterface => {
    return queryInterface.renameTable('deliveries', 'packages');
  },

  down: queryInterface => {
    return queryInterface.renameTable('packages', 'deliveries');
  },
};
