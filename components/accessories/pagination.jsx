export default function Pagination({load,updateFunction}) {
   const paginate = (value) => {
      updateFunction(value);
      load(true);
   }
   return (
      <nav aria-label="Page navigation example br-0 "> 
         <ul className="pagination pointer ">
            <li onClick={(ev) => {paginate(1)}} className="page-item pointer br-0"><a className="page-link" >1</a></li>
            <li onClick={(ev) => {paginate(2)}} className="page-item pointer"><a className="page-link" >2</a></li>
            <li onClick={(ev) => { paginate(3)}} className="page-item pointer"><a className="page-link" >3</a></li>
            <li onClick={(ev) => { paginate(4) }} className="page-item pointer"><a className="page-link" >4</a></li>
            <li onClick={(ev) => {paginate(5)}} className="page-item pointer"><a className="page-link" >5</a></li>
            <li onClick={(ev) => {paginate('increment')}} className="page-item pointer"><a className="page-link" >Next</a></li>
            <li onClick={(ev) => {paginate('decrement')}} className="page-item pointer"><a className="page-link" >Previous</a></li>
         </ul>
      </nav>
   )
}