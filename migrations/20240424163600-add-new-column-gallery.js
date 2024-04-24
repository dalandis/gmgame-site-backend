'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'gallery', // table name
        'visit', // new field name
        {
          type: Sequelize.STRING,
          allowNull: false,
        },
      ),
      queryInterface.addColumn(
        'gallery', // table name
        'world', // new field name
        {
          type: Sequelize.STRING,
          allowNull: false,
        },
      ),
      queryInterface.addColumn(
        'gallery', // table name
        'branch', // new field name
        {
          type: Sequelize.STRING,
          allowNull: false,
        },
      ),
      queryInterface.addColumn(
        'gallery', // table name
        'coordinates', // new field name
        {
          type: Sequelize.STRING,
          allowNull: false,
        },
      ),
    ]);
  },

  down(queryInterface, Sequelize) {
    // logic for reverting the changes
    return Promise.all([
      queryInterface.removeColumn('gallery', 'visit'),
      queryInterface.removeColumn('gallery', 'world'),
      queryInterface.removeColumn('gallery', 'branch'),
      queryInterface.removeColumn('gallery', 'coordinates')
    ]);
  },
};
