'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      'SELECT username, tag FROM users;'
    )

    users[0].map(async user => {
      try {
        let fixTag = user.tag.replace(/'/g, '"').replace(/True/g, true).replace(/False/g, false);
        await queryInterface.sequelize.query(
          'UPDATE users SET tag = :newTag WHERE username = :username',
          {
            replacements: {
              newTag: fixTag,
              username: user.username
            }
          }
        )
      } catch (e) {
        console.log('not update ', user);
      } 
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
