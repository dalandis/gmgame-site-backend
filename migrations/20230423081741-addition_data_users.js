const csv = require('csv-parser')
const fs = require('fs')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const results = [];
    let logs = [];

    fs.createReadStream('migrations/Discord GMGame - База.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        results.forEach(async (item) => {
            let firstDate = '';
            let leaveDate;
            let actrionDates = [];

            if (item['Дата входа \nв дискорд'].match(/^(\d{2})\.(\d{2})\.(\d{4})$/)) {
                firstDate = item['Дата входа \nв дискорд'];
            } 

            if (item['Дата выхода \nиз дискорда'].match(/^(\d{2})\.(\d{2})\.(\d{4})$/)) {
                leaveDate = item['Дата выхода \nиз дискорда'];
            } else if (item['Дата выхода \nиз дискорда'].match(/^.*(\d{2})\.(\d{2})\.(\d{4})/)) {
                item['Дата выхода \nиз дискорда'].split('\n').forEach((date) => {
                    const firsSymbol = date.slice(0,1);

                    if (firsSymbol === '+' && firstDate === '') {
                        firstDate = date.slice(1);
                    }

                    if (firsSymbol === '-' && leaveDate === '') {
                        leaveDate = date.slice(1);
                    }

                    if (firsSymbol === '+') {
                        actrionDates.push({actrion: 'join', date: date.slice(1)});
                    } 

                    if (firsSymbol === '-') {
                        actrionDates.push({actrion: 'leave', date: date.slice(1)});
                    }
                });
            }

            let log = [];

            if (firstDate) {
                log.push({date: firstDate, message: 'Вход в дискорд'});
            }

            if (leaveDate) {
                log.push({date: leaveDate, message: 'Выход из дискорда'});
            }

            //Дата удаления\nиз WL или бана
            let immun = false;
            if (item['Дата удаления\nиз WL или бана'] === 'Имун') {
                immun = true;
            }

            // Другие сведения
            let note = '';
            if (item['Другие сведения']) {
                note = item['Другие сведения'];
            }

            if (actrionDates.length > 0) {
                actrionDates.forEach((date) => {
                    log.push({date: date.date, message: date.actrion === 'join' ? 'Вход в дискорд' : 'Выход из дискорда'});
                });
            }

            // if (log.length) {
            //     logs.push({id: item.ID, log: log, immun: immun, note: note});
            // }

            log.forEach(async (log) => {
              const dateArr = log.date.split(".");
              // console.log(Date.parse(`${dateArr[1]}.${dateArr[0]}.${dateArr[2]}`), 'llll', log.date, 'll')
              await queryInterface.sequelize.query(
                'INSERT INTO logs (log, user_id, manager, log_date, createdAt, updatedAt) VALUES (:log, :user_id, :manager, :log_date, NOW(), NOW())',
                {
                  replacements: {
                    log: log.message,
                    user_id: item.ID,
                    manager: 'Import Discord GMGame - База.csv',
                    log_date: new Date(Date.parse(`${dateArr[1]}.${dateArr[0]}.${dateArr[2]}`)).toISOString().slice(0, 19).replace('T', ' ')
                    // new Date(1091040026000).toISOString().slice(0, 19).replace('T', ' ');
                  }
                }
              )
            })

            await queryInterface.sequelize.query(
              'UPDATE users SET immun = :immun, note = :note, expiration_date = :expiration_date WHERE user_id = :user_id',
              {
                replacements: {
                  immun: immun,
                  note: note,
                  expiration_date: new Date(),
                  user_id: item.ID
                }
              }
            )
        });

        // console.log(results)
      });
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
