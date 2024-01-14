import { useEffect, useState } from "react"
import { customFetch } from "../Auth/customFetch";

export default function Pagination({updateFuntion,setLoader,state,endpoint}) {
   const [query, setQuery] = useState({ count: 10, page: 0 });

   const changePage = (num) => {
      if (query.count > 3) {
         setQuery({ ...query, page: parseInt(num) + query.page });
         return;
      }
      setQuery({ ...query, page: num })
   };

   const changeToPrevious = () => {
      if (query.page > 0) {
         setQuery({ ...query, page: parseInt(query.page) - 1 });
       }
      return;
   }

   useEffect(() => {
      const { count, page } = query;
      let urlquery = `${endpoint}?count=${count}&&page=${page}`;
      customFetch(urlquery)
         .then((data) => updateFuntion(data))
         .catch((err) => console.log(err))
         .finally(() => setLoader(false));
   }, [query, endpoint, updateFuntion, setLoader]);
   
   return (
      <nav aria-label="Page navigation example ">
         <ul class="pagination pointer">
            <li onClick={(ev) => {changePage(1)}} class="page-item pointer"><a class="page-link" >1</a></li>
            <li onClick={(ev) => {changePage(2)}} class="page-item pointer"><a class="page-link" >2</a></li>
            <li onClick={(ev) => {changePage(3)}} class="page-item pointer"><a class="page-link" >3</a></li>
            <li onClick={(ev) => {changePage(4)}} class="page-item pointer"><a class="page-link" >Next</a></li>
            <li onClick={changeToPrevious()} class="page-item pointer"><a class="page-link" >Previous</a></li>
         </ul>
      </nav>
   )
}