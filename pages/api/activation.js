import connection from "./db";



const activation = {
    ACTIVATION_PAGE_QUERY: `SELECT ID,PATIENTID,FULLNAME,DATE,ACTIVATION_STATUS FROM NEW_PATIENTS ORDER BY DATE ASC LIMIT 50`,
    // get partial data of patients
    getPartialData: function (request, response) {
        connection.query(this.ACTIVATION_PAGE_QUERY, (err, result) => {
            if (err) {
                throw err;
            }
            response.send(result)
        })
    }
}

















function handler(request, response) {
    switch (request.method) {
        case 'GET':
            activation.getPartialData(request, response)
            break;

        default:
            response.send('Method case still in progress')
    }
}


export default handler;