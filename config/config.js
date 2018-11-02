require('dotenv').config();

module.exports = {
    development: {
        username : process.env.SEQUELIZE_ID,
        password: process.env.SEQUELIZE_PASSWORD,
        database : 'sharever',
        host: '127.0.0.1',
        dialect: 'mysql',
        operatorAliases : 'false',
        timezone : 'Asia/Seoul'
    },
    production: {
        username : process.env.SEQUELIZE_ID,
        password: process.env.SEQUELIZE_PASSWORD,
        database : 'sharever',
        host: '127.0.0.1',
        dialect: 'mysql',
        operatorAliases : 'false',
        logging: false,
        timezone : 'Asia/Seoul'
    }
};