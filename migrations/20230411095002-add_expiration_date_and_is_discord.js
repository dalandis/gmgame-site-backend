'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'users', // table name
        'expiration_date', // new field name
        {
          type: Sequelize.DATE,
          allowNull: true,
        },
      ),
      queryInterface.addColumn(
        'users', // table name
        'is_discord', // new field name
        {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
      ),
      queryInterface.changeColumn(
        'users', // table name
        'username',
        {
          type: Sequelize.STRING,
          allowNull: true,
        }
      ),
      queryInterface.changeColumn(
        'users', // table name
        'password',
        {
          type: Sequelize.STRING,
          allowNull: true,
        }
      ),
    ]);
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('users', 'expiration_date'),
      queryInterface.removeColumn('users', 'is_discord'),
      queryInterface.changeColumn(
        'users', // table name
        'username',
        {
          type: Sequelize.STRING,
          allowNull: false,
        }
      ),
      queryInterface.changeColumn(
        'users', // table name
        'password',
        {
          type: Sequelize.STRING,
          allowNull: false,
        }
      ),
    ]);
  }
};
