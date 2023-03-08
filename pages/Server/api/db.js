const {createConnection} = require('mysql');

const connection = createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'limsdb'
})

connection.connect(err => {
    if (err) throw err;
    console.log('Connected to database');
})


module.exports = connection;