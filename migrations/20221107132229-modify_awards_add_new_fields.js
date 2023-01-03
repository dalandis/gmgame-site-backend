'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'prize', // table name
        'createdAt', // new field name
        {
          type: Sequelize.DATE,
          allowNull: true,
        },
      ),
      queryInterface.addColumn(
        'prize', // table name
        'updatedAt', // new field name
        {
          type: Sequelize.DATE,
          allowNull: true,
        },
      )
    ]);
  },

  down(queryInterface, Sequelize) {
    // logic for reverting the changes
    return Promise.all([
      queryInterface.removeColumn('prize', 'createdAt'),
      queryInterface.removeColumn('prize', 'updatedAt')
    ]);
  },
};
