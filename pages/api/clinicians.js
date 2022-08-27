import connection from "./db";


// get all clinicians
const getClinicians = (req, res) => {
    let query = 'SELECT ID,NAME FROM clinician';
    // execute query
    connection.query(query, (err, result) => {
        if (err) {
            throw err
        }
        res.send(result)
    })
}
// update clinicians

const putClinicians = (req, res) => {
    const { id, name } = req.body;
    let query = `UPDATE clinician SET NAME = ? WHERE ID = ?`;
    // execute query
    connection.query(query, [name, id], (err, result) => {
        if (err) {
            throw err
        }
        res.send(result)
    }
    )
}


// delete clinician

const deleteClinicians = (req, res) => {
    const { id } = req.body;
    let query = `DELETE FROM clinician WHERE ID = ?`;
    // execute query
    connection.query(query, [id], (err, result) => {
        if (err) {
            throw err
        }
        res.send(result)
    }
    )
}


const postClinicians = (req, res) => {
    const { name } = req.body;
    let query = `INSERT INTO clinician (NAME) VALUES (?)`;
    // execute query
    connection.query(query, [name], (err, result) => {
        if (err) {
            throw err
        }
        res.send(result)
    }
    )
}



export default function handler(request, response) {
    switch (request.method) {
        case 'GET':
            // get name of all Clinicians
            getClinicians(request, response)
            break
        case 'POST':
            // add new Clinicians
            postClinicians(request, response)
            break
        case 'PUT':
            // update Clinicians
            putClinicians(request, response)
            break
        case 'DELETE':
            // delete Clinicians
            deleteClinicians(request, response)
            break
        default:
            response.status(400).send({
                message: 'Method not allowed'
            })
    }
}