module.exports = (sequelize, DataTypes) => (
    sequelize.define('chat', {
        chat: {
            type : DataTypes.STRING,
        },
        image: {
            type : DataTypes.STRING,
        },
    }, {
        timestamps: true,
        paranoid : true,
        charset : 'utf8',
        collate: 'utf8_general_ci'
    })
);