import CardRacks from "../../accessories/CardRacks"
export default function DepartmentSummaryPendingView({ data, active, handleClick }) {
   return (
      <div className="grid-5">
         {
             data.map((item, index) => {
               return (
                  <CardRacks
                     key={item?.departmentid}
                     activestate={active === item?.departmentid}
                     onClick={(ev) => { handleClick(item?.departmentid)}}
                     header={<h5 className="m-0">{item.department}</h5>}
                     body={<h1 className="mx-3 ">{item?.pending}</h1>}
                     />
              )
            })
         }
     </div>
   )
}