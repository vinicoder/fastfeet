module.exports = {
  up: queryInterface => {
    return queryInterface.renameColumn(
      'deliveries',
      'deliveryman_id',
      'courier_id'
    );
  },
};
