import * as csv from 'csv-parser';
import * as fs from 'fs';

const results = [];
let logs = [];

fs.createReadStream('./migrations/Discord GMGame - База.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    results.forEach((item) => {
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

                if (firsSymbol === '+' && !firstDate) {
                    actrionDates.push({actrion: 'join', date: date.slice(1)});
                } 

                if (firsSymbol === '-' && !leaveDate) {
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

        if (actrionDates.length) {
            actrionDates.forEach((date) => {
                log.push({date: date.date, message: date.actrion === 'join' ? 'Вход в дискорд' : 'Выход из дискорда'});
            });
        }

        if (log.length) {
            logs.push({id: item.ID, log: log, immun: immun, note: note});
        }
    });
    console.log(JSON.stringify(results))
  });