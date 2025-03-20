export default function UseCustomResultCommentsTemplatingPrintOut({ comments }) {


     return (
          <div>
               {comments && comments.length > 0 && <h5>Comments</h5>}
               <div style={{ fontSize: '15px' }} dangerouslySetInnerHTML={{ __html: comments }} />
               <hr className="p-0 " />
               <span className="text-muted d-flex justify-content-center text-sm">******End of Report ******</span>
          </div>
     )
}
