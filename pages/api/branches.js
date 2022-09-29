import database_queries from "./database/queries";
export default function handler(request, response) {
 const method = request.method;
 switch (method) {
  case 'POST':
   const { branch } = JSON.parse(request.body);
   console.log(branch)
   database_queries.addBranch(branch, request, response);
   break
  case 'GET':
   database_queries.getBranch(request, response)
   break;
  case 'PUT':
   const { branchid, branchname, request, response } = request.body;
   database_queries.editBranch(branchid, branchname, request, response)
   break
  case 'DELETE':
   const { branch_id } = request.body;
   database_queries.deleteBranch(branch_id, request, response);
   break
  default:
   response.send({
    message: 'method not found'
   })
 }
}


