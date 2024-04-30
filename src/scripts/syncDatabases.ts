import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { getConnectionToken } from '@nestjs/sequelize';
import { exit } from 'process';

(async () => {
  console.log('Starting...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const prismaService = app.get(PrismaService);
  const sequelizeService = app.get(getConnectionToken());

  const users = (await sequelizeService.query('SELECT * FROM users')) as any[];

  let usersData = [];

  for (const user of users[0]) {
    let jsonString;

    if (user.user_id === '806822661387714560') {
      jsonString = user.tag.replace(/\\U/g, '\\u');
    }

    if (user.user_id === '692796072510226564') {
      jsonString = user.tag.replace(/\\U/g, '\\u');
      jsonString = jsonString.replace(/"\"(\\u0001f965Гл.Кокос\\u0001f965)\""/, '"$1"');
    }

    if (user.user_id === '988669601569185822') {
      jsonString = user.tag.replace(/"\"(№02.K1ng)"/, '"$1"');
    }

    usersData.push({
      username: user.username,
      password: user.password,
      tag: JSON.parse(jsonString || user.tag),
      type: user.type,
      age: user.age,
      from_about: user.from_about,
      you_about: user.you_about,
      status: user.status,
      user_id: user.user_id,
      partner: user.partner,
      reg_date: user.reg_date
        ? new Date(user.reg_date)
        : user.createdAt
        ? new Date(user.createdAt)
        : new Date('2021-01-01T00:00:00.000Z'),
      markers: user.markers,
      territories: user.territories,
      awards: user.awards,
      tickets: user.tickets,
      oldUsers: user.oldUsers,
      logs: user.logs,
      gallery: user.gallery,
      immun: user.immun ? Boolean(user.immun) : Boolean(false),
      note: user.note,
      expiration_date: user.expiration_date
        ? new Date(user.expiration_date)
        : new Date('2021-01-01T00:00:00.000Z'),
      is_discord: user.is_discord ? Boolean(user.is_discord) : Boolean(false),
      citizenship: user.citizenship ? Boolean(user.citizenship) : Boolean(false),
      balance: user.balance,
      server: user.server,
      friends: user.friends,
      reapplication: user.reapplication ? Boolean(user.reapplication) : Boolean(false),
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date('2021-01-01T00:00:00.000Z'),
      updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date('2021-01-01T00:00:00.000Z'),
    });
  }

  await prismaService.users.createMany({
    data: usersData,
  });

  const oldUsers = (await sequelizeService.query('SELECT * FROM old_users')) as any[];

  let oldUsersData = [];

  for (const oldUser of oldUsers[0]) {
    let fixedJson = oldUser.tag.replace(/\\\\\\/g, '\\');
    fixedJson = fixedJson.replace(/^"\\/, '');
    fixedJson = fixedJson.replace(/\\""$/, '"');

    oldUsersData.push({
      user_id: oldUser.user_id,
      username: oldUser.username,
      password: oldUser.password,
      tag: JSON.parse(JSON.parse(fixedJson)),
      type: oldUser.type,
      age: oldUser.age,
      from_about: oldUser.from_about,
      you_about: oldUser.you_about,
      status: oldUser.status,
      partner: oldUser.partner,
      reg_date: oldUser.reg_date
        ? new Date(oldUser.reg_date)
        : oldUser.createdAt
        ? new Date(oldUser.createdAt)
        : new Date('2021-01-01T00:00:00.000Z'),
      immun: oldUser.immun ? Boolean(oldUser.immun) : Boolean(false),
      note: oldUser.note,
      expiration_date: oldUser.expiration_date
        ? new Date(oldUser.expiration_date)
        : new Date('2021-01-01T00:00:00.000Z'),
      is_discord: oldUser.is_discord ? Boolean(oldUser.is_discord) : Boolean(false),
      citizenship: oldUser.citizenship ? Boolean(oldUser.citizenship) : Boolean(false),
      balance: oldUser.balance,
      server: oldUser.server,
      friends: oldUser.friends,
      reapplication: oldUser.reapplication ? Boolean(oldUser.reapplication) : Boolean(false),
      createdAt: oldUser.createdAt
        ? new Date(oldUser.createdAt)
        : new Date('2021-01-01T00:00:00.000Z'),
      updatedAt: oldUser.updatedAt
        ? new Date(oldUser.updatedAt)
        : new Date('2021-01-01T00:00:00.000Z'),
    });
  }

  await prismaService.oldUsers.createMany({
    data: oldUsersData,
  });

  const tickets = (await sequelizeService.query('SELECT * FROM tickets')) as any[];

  let ticketsData = [];

  for (const ticket of tickets[0]) {
    ticketsData.push({
      user_id: ticket.user_id,
      name: ticket.name,
      createdAt: ticket.createdAt
        ? new Date(ticket.createdAt)
        : new Date('2021-01-01T00:00:00.000Z'),
      updatedAt: ticket.updatedAt
        ? new Date(ticket.updatedAt)
        : new Date('2021-01-01T00:00:00.000Z'),
    });
  }

  await prismaService.users.create({
    data: {
      tag: {},
      user_id: '1061202682263646229',
      status: 6,
      age: 0,
      from_about: '',
      you_about: '',
      is_discord: false,
      type: 0,
    },
  });

  await prismaService.tickets.createMany({
    data: ticketsData,
  });

  const territories = (await sequelizeService.query('SELECT * FROM territories')) as any[];

  let territoriesData = [];

  for (const territory of territories[0]) {
    const user = await prismaService.users.findUnique({
      where: {
        user_id: territory.user,
      },
    });

    if (!user) {
      console.log('User not found for terrs:', territory.user);
      continue;
    }

    territoriesData.push({
      user_id: territory.user,
      name: territory.name,
      xStart: territory.xStart,
      zStart: territory.zStart,
      xStop: territory.xStop,
      zStop: territory.zStop,
      world: territory.world,
      status: territory.status,
      createdAt: territory.createdAt
        ? new Date(territory.createdAt)
        : new Date('2021-01-01T00:00:00.000Z'),
      updatedAt: territory.updatedAt
        ? new Date(territory.updatedAt)
        : new Date('2021-01-01T00:00:00.000Z'),
    });
  }

  await prismaService.territories.createMany({
    data: territoriesData,
  });

  const markers = (await sequelizeService.query('SELECT * FROM markers')) as any[];

  let markersData = [];

  for (const marker of markers[0]) {
    const user = await prismaService.users.findUnique({
      where: {
        user_id: marker.user,
      },
    });

    if (!user) {
      console.log('User not found for masrkers:', marker.user);
      continue;
    }

    markersData.push({
      user_id: marker.user,
      id_type: marker.id_type,
      x: marker.x,
      y: marker.y,
      z: marker.z,
      name: marker.name,
      description: marker.description,
      server: marker.server,
      flag: marker.flag,
      createdAt: marker.createdAt
        ? new Date(marker.createdAt)
        : new Date('2021-01-01T00:00:00.000Z'),
      updatedAt: marker.updatedAt
        ? new Date(marker.updatedAt)
        : new Date('2021-01-01T00:00:00.000Z'),
    });
  }

  await prismaService.markers.createMany({
    data: markersData,
  });

  const awards = (await sequelizeService.query('SELECT * FROM prize')) as any[];

  let awardsData = [];

  for (const award of awards[0]) {
    const user = await prismaService.users.findUnique({
      where: {
        user_id: award.user_id,
      },
    });

    if (!user) {
      console.log('User not found for awards:', award.user_id);
      continue;
    }

    awardsData.push({
      user_id: award.user_id,
      type: award.type,
      issued: Boolean(award.issued),
      createdAt: award.createdAt ? new Date(award.createdAt) : new Date('2021-01-01T00:00:00.000Z'),
      updatedAt: award.updatedAt ? new Date(award.updatedAt) : new Date('2021-01-01T00:00:00.000Z'),
    });
  }

  await prismaService.awards.createMany({
    data: awardsData,
  });

  const logs = (await sequelizeService.query('SELECT * FROM logs')) as any[];

  let logsData = [];

  for (const log of logs[0]) {
    logsData.push({
      log: log.log,
      user_id: log.user_id,
      manager: log.manager,
      managerId: log.managerId,
      log_date: log.log_date ? new Date(log.log_date) : new Date('2021-01-01T00:00:00.000Z'),
      type: log.type,
      createdAt: log.createdAt ? new Date(log.createdAt) : new Date('2021-01-01T00:00:00.000Z'),
      updatedAt: log.updatedAt ? new Date(log.updatedAt) : new Date('2021-01-01T00:00:00.000Z'),
    });

    const user = await prismaService.users.findUnique({
      where: {
        user_id: log.user_id,
      },
    });

    if (!user) {
      await prismaService.users.create({
        data: {
          tag: {},
          user_id: log.user_id,
          status: 6,
          age: 0,
          from_about: '',
          you_about: '',
          is_discord: false,
          type: 0,
        },
      });
    }
  }

  await prismaService.logs.createMany({
    data: logsData,
  });

  const gallery = (await sequelizeService.query('SELECT * FROM gallery')) as any[];

  let galleryData = [];

  for (const image of gallery[0]) {
    galleryData.push({
      author: image.author,
      name: image.name,
      description: JSON.parse(image.description),
      aprove: Boolean(image.aprove),
      warning: Boolean(image.warning),
      createdAt: image.createdAt ? new Date(image.createdAt) : new Date('2021-01-01T00:00:00.000Z'),
      updatedAt: image.updatedAt ? new Date(image.updatedAt) : new Date('2021-01-01T00:00:00.000Z'),
    });
  }

  await prismaService.gallery.createMany({
    data: galleryData,
  });

  const galleryImages = (await sequelizeService.query('SELECT * FROM gallery_images')) as any[];

  let galleryImagesData = [];

  for (const image of galleryImages[0]) {
    const gallery = await prismaService.gallery.findFirst({
      where: {
        id: image.gallery_id,
      },
    });

    let newGalleryId;

    if (!gallery) {
      const galleryForName = (await sequelizeService.query(
        `SELECT * FROM gallery WHERE id = ${image.gallery_id}`,
      )) as any[];

      newGalleryId = await prismaService.gallery.findFirst({
        where: {
          name: galleryForName[0][0].name,
        },
      });
    }

    galleryImagesData.push({
      gallery_id: newGalleryId?.id || image.gallery_id,
      image: image.image,
      createdAt: image.createdAt ? new Date(image.createdAt) : new Date('2021-01-01T00:00:00.000Z'),
      updatedAt: image.updatedAt ? new Date(image.updatedAt) : new Date('2021-01-01T00:00:00.000Z'),
    });
  }

  await prismaService.galleryImages.createMany({
    data: galleryImagesData,
  });

  const regens = (await sequelizeService.query('SELECT * FROM regens')) as any[];

  let regensData = [];

  for (const regen of regens[0]) {
    regensData.push({
      user_id: regen.user_id,
      status: regen.status,
      username: regen.username,
      createdAt: regen.createdAt ? new Date(regen.createdAt) : new Date('2021-01-01T00:00:00.000Z'),
      updatedAt: regen.updatedAt ? new Date(regen.updatedAt) : new Date('2021-01-01T00:00:00.000Z'),
    });
  }

  await prismaService.regens.createMany({
    data: regensData,
  });

  const faq = (await sequelizeService.query('SELECT * FROM faq')) as any[];

  let faqData = [];

  for (const faqItem of faq[0]) {
    faqData.push({
      quest: faqItem.quest,
      answer: JSON.parse(faqItem.answer),
      show: Boolean(faqItem.show),
      category: faqItem.category,
      createdAt: faqItem.createdAt
        ? new Date(faqItem.createdAt)
        : new Date('2021-01-01T00:00:00.000Z'),
      updatedAt: faqItem.updatedAt
        ? new Date(faqItem.updatedAt)
        : new Date('2021-01-01T00:00:00.000Z'),
    });
  }

  await prismaService.faq.createMany({
    data: faqData,
  });

  exit(0);
})();
