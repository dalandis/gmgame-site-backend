'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tickets', null, {});

    await queryInterface.removeColumn('tickets', 'html');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('tickets', 'html', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};
