module.exports = {
  up: queryInterface => {
    return queryInterface.renameTable('deliverymen', 'couriers');
  },

  down: queryInterface => {
    return queryInterface.renameTable('couriers', 'deliverymen');
  },
};
