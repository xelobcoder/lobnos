import connection from "./db";
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




export default function handler(request, response) {
    switch (request.method) {
        case 'GET':
            // get name of all organizations
            getOrganizations(request, response)
            break
        case 'POST':
            // add new organization
            postOrganization(request, response)
            break
        case 'PUT':
            // update organization
            putOrganization(request, response)
            break
        case 'DELETE':
            // delete organization
            deleteOrganization(request, response)
            break
        default:
            response.status(400).send({
                message: 'Method not allowed'
            })
    }
}