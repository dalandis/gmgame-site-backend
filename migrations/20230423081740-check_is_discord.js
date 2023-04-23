'use strict';
const axios = require('axios');
const {join} = require('path');

require('dotenv').config({ path: join(__dirname, '../', '.env.server-api') })

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let i = 0;
    await queryInterface.sequelize.query(
      'SELECT user_id, username FROM users'
    ).then(async (users) => {
      for (const user of users[0]) {
        const response = await axios.request({
          data: JSON.stringify({user: user.user_id}),
          method: 'POST',
          url: process.env.URL_FOR_BOT_API + 'check_user_define',
          headers: {
            Authorization: 'Bearer ' + process.env.TOKEN_FOR_BOT_API,
            'Content-type': 'application/json'
          }
        });

        const result = await axios.request({
          data: JSON.stringify({user: user.username}),
          method: 'POST',
          url: process.env.URL_FOR_SERVER_API + 'get_date_last_login',
          headers: {
            Authorization: 'Bearer ' + process.env.TOKEN_FOR_SERVER_API,
            'Content-type': 'application/json'
          }
        });

        console.log(result.data.lastlogin);

        let expDate = new Date(result.data.lastlogin || Date.now());

        if (response.data.data) {
          expDate.setDate(expDate.getDate() + 60);
        } else {
          expDate.setDate(expDate.getDate() + 14);
        }

        let date = expDate.toISOString().slice(0, 19).replace('T', ' ');
        
        i++;
        console.log(date, i)

        await queryInterface.sequelize.query(
          `UPDATE users SET is_discord = ${response.data.data}, expiration_date = '${date}' WHERE user_id = ${user.user_id}`
        );
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'UPDATE users SET is_discord = 0, expiration_date = NULL'
    );
  }
};
