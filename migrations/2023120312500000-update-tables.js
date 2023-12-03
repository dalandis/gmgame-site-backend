'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "UPDATE `users` SET age = CASE WHEN REGEXP_REPLACE(age, '[a-zA-ZА-Яа-я.]', '') = '' THEN '0' ELSE REGEXP_REPLACE(age, '[a-zA-ZА-Яа-я.]', '') END;",
    );

    await queryInterface.sequelize.query(
      'UPDATE users SET updatedAt = NOW() WHERE updatedAt IS NULL;',
    );

    await queryInterface.sequelize.query(
      'UPDATE users SET createdAt = NOW() WHERE createdAt IS NULL;',
    );

    await queryInterface.sequelize.query(
      'UPDATE prize SET createdAt = NOW() WHERE createdAt IS NULL;',
    );

    await queryInterface.sequelize.query(
      'UPDATE prize SET updatedAt = NOW() WHERE updatedAt IS NULL;',
    );

    await queryInterface.sequelize.query(
      'UPDATE markers SET updatedAt = NOW() WHERE updatedAt IS NULL;',
    );

    await queryInterface.sequelize.query(
      'UPDATE markers SET createdAt = NOW() WHERE createdAt IS NULL;',
    );

    await queryInterface.sequelize.query(
      'UPDATE territories SET createdAt = NOW() WHERE createdAt IS NULL;',
    );

    await queryInterface.sequelize.query(
      'UPDATE territories SET updatedAt = NOW() WHERE updatedAt IS NULL;',
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE logs MODIFY COLUMN log TEXT;',
    );
  },

  async down(queryInterface, Sequelize) {
    //
  },
};
