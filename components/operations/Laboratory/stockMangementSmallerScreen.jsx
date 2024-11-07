import React from "react"
import VisibilityIcon from '@mui/icons-material/Visibility';
export default function StockManagementSmallerScreen({ item ,handleActionClick}) {
     return (
          <React.Fragment key={item.ascensionid}>
               <li className="list-group-item bg-secondary-subtle fw-bold text-capitalize">
                    {item.fullname} ({item.patientid})
               </li>
               <div className="list-group-item">
                    <div className="d-flex flex-column pls-color">
                         <span>Ascension ID: {item.ascensionid}</span>
                         <span>Unit: {item.department}</span>
                         <span>Test: {item.name}</span>
                         <span>Deduction Quantity: {item.quantity}</span>
                    </div>
               </div>
               <div className="list-group-item d-flex justify-content-end">
                    <span
                         onClick={() => handleActionClick(item)}
                         aria-label="View"
                    >
                         <VisibilityIcon />
                    </span>
               </div>
          </React.Fragment>
     )
}