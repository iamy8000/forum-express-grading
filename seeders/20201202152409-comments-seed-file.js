'use strict';
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Comments',
      Array.from({ length: 20 }).map((d, i) =>
        ({
          text: faker.lorem.sentence(),
          createdAt: new Date(),
          updatedAt: new Date(),
          RestaurantId: Math.floor(Math.random() * 6) * 10  + 1,
          UserId: Math.floor(Math.random() * 2) * 10 + 1
        })
      ), {});

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', null, {})
  }
};
