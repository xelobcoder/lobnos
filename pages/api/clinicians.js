import connection from "./db";


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