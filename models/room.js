module.exports = (sequelize, DataTypes) => (
    sequelize.define('room', {
        title : {
            type : DataTypes.STRING,
            allowNull : false,
        },
        max : {
            type : DataTypes.INTEGER,
            allowNull : false,
            defaultValue : 10,
            validate : {min : 2}
        },
        password : {
            type: DataTypes.STRING,
        }
    }, {
        timestamps: true,
        paranoid : true,
        charset : 'utf8',
        collate: 'utf8_general_ci'
    })
);