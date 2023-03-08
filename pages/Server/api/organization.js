const connection = require('./db');

const getOrganizations = (req, res) => {
    let query = 'SELECT ID,NAME FROM organization';
    // execute query
    connection.query(query, (err, result) => {
        if (err) {
            throw err
        }
        res.send(result)
    })
}




module.exports = {
    getOrganizations
}