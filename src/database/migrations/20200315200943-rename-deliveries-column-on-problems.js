module.exports = {
  up: queryInterface => {
    return queryInterface.renameColumn('problems', 'delivery_id', 'package_id');
  },
  down: queryInterface => {
    return queryInterface.renameColumn('problems', 'package_id', 'delivery_id');
  },
};
