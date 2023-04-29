'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn(
        'territories', // table name
        'status', // new field name
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),
    ]);

    const territories = await queryInterface.sequelize.query(
      'SELECT id, name FROM territories;'
    )

    territories[0].map(async territory => {
      let status = 'active';
      if (territory.name.includes('[hold]') || territory.name.includes('[?]')) {
        status = 'hold';
      }
      if (territory.name.includes('[repopulate]') || territory.name.includes('[$]')) {
        status = 'repopulate';
      }

      await queryInterface.sequelize.query(
        'UPDATE territories SET status = :status WHERE id = :id',
        {
          replacements: {
            status: status,
            id: territory.id
          }
        }
      )
    })
  },

  async down (queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.removeColumn('territories', 'status'),
    ]);
  }
};
