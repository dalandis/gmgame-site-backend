'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'users', // table name
        'immun', // new field name
        {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
      ),
      queryInterface.addColumn(
        'users', // table name
        'note', // new field name
        {
          type: Sequelize.TEXT,
          allowNull: true,
        },
      )
    ]);
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('users', 'immun'),
      queryInterface.removeColumn('users', 'note')
    ]);
  }
};
