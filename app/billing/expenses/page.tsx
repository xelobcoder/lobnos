"use client"
import Link from "next/link";
import { useState, useEffect } from "react";
import { Pagination } from "react-bootstrap";
// Assuming react-select might be available or a simple select is fine.
// For simplicity, I'll use a standard HTML select as react-select is not explicitly imported here.
import { currencyFormatter, customFetch, updatePagination } from "../../../components/Auth/customFetch";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";



// Define the ExpenseCategory interface (same as in the form page)
interface ExpenseCategory {
    id: number;
    name: string;
}

export default function ExpenseList() {
     const [expenses, setExpenses] = useState([]);
     const [filter, setFiltering] = useState({ page: 1, count: 10, categoryId: '' }); // Added categoryId
     const [shoudload, setLoad] = useState(false); // This state seems unused, consider removing if not needed.
     const { applicationsettings } = useApplicationSettings();
     const { employeeid, username, role } = applicationsettings.user || {}; // Added default for user
     const branchid = applicationsettings.branchid;

    // State for filterable categories
    const [filterableCategories, setFilterableCategories] = useState<ExpenseCategory[]>([]);

    // Mocked categories data
    const mockCategories: ExpenseCategory[] = [
        { id: 1, name: 'Travel' },
        { id: 2, name: 'Meals & Entertainment' },
        { id: 3, name: 'Software & Subscriptions' },
        { id: 4, name: 'Office Supplies' },
    ];

    // useEffect to "fetch" categories (using mocked data)
    useEffect(() => {
        // Simulate API call delay
        setTimeout(() => {
            setFilterableCategories(mockCategories);
        }, 500);
    }, []);


     const columns = [
          { Header: 'Expense', accessor: 'name' },
          { Header: 'Merchant', accessor: 'merchant' }, // Capitalized Merchant
          { Header: "Submitter", accessor: 'username' }, // Capitalized Submitter
          { Header: 'Category', accessor: 'expense_category_name' }, // New Category column
          { Header: 'Expense Date', accessor: 'date', Cell: ({ value }) => new Date(value).toLocaleDateString() }, // Capitalized
          { Header: 'Submitted On', accessor: 'createdon', Cell: ({ value }) => new Date(value).toLocaleDateString() }, // Capitalized
          {
               Header: 'Amount', accessor: 'amount', Cell: ({ value, row }) => { // original seems unused here
                    return currencyFormatter.format(value)
               }
          },
          {
               Header: 'Status', accessor: "approved", Cell: ({ value, row }) => { // Capitalized
                    if (value == 0) { // Assuming 0 is pending
                         return (
                              <div>
                                   <span className="text-capitalize text-warning mx-2">Pending</span>
                                   {/* Ensure row.original.id exists and is correct */}
                                   <Link href={`/billing/expenses/create-new-expense?action=edit&&id=${row.original.id}`}>Edit</Link>
                              </div>
                         )
                    } else if (value == 1) { // Assuming 1 is approved
                         return (
                              <div className="d-flex">
                                   <span className="text-capitalize text-success">Approved</span>
                                   {/* Ensure row.original.id exists */}
                                   <Link className="mx-2 border-bottom-1" href={`/billing/expenses/receipt/${row.original.id}`}>Upload Receipt</Link>
                              </div>
                         )
                    } else { // Assuming other values mean rejected or another status
                         return <div className="text-capitalize text-danger">Rejected</div>
                    }
               }
          }
     ]

     useEffect(() => {
          if (employeeid && branchid) {
               let fetchUrl = `expenses/records?branchid=${branchid}&&employeeid=${employeeid}&&page=${filter.page}&&count=${filter.count}`;
               if (filter.categoryId && filter.categoryId !== '') {
                    fetchUrl += `&&category_id=${filter.categoryId}`; // Use category_id for the API
               }
               customFetch(fetchUrl)
                    .then((data) => {
                         setExpenses(data);
                    }).catch((err) => {
                         console.error("Error fetching expenses:", err); // Changed to console.error
                         setExpenses([]); // Set to empty array on error
                    })
          }
     }, [employeeid, branchid, filter]);



     const updatePage = (value) => {
          // Ensure that updatePagination correctly handles the existing filter state including categoryId
          updatePagination(value, setFiltering, filter);
     }

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFiltering(prevFilter => ({
            ...prevFilter,
            [name]: value,
            page: 1 // Reset to page 1 when filters change
        }));
    };

     return (
         <div className="container-fluid p-4"> {/* Added container-fluid and padding */}
              <section className="mb-4 my-2 p-3 bg-light border rounded"> {/* Added padding, bg, and border */}
                    <div className="row g-3 align-items-center"> {/* Using Bootstrap grid for better alignment */}
                         <div className="col-auto">
                              <label htmlFor="startDate" className="col-form-label">From:</label>
                         </div>
                         <div className="col-auto">
                              <input type="date" id="startDate" name="startDate" onChange={handleFilterChange} className="form-control form-control-sm" /> {/* Bootstrap form-control */}
                         </div>
                         <div className="col-auto">
                              <label htmlFor="endDate" className="col-form-label">To:</label>
                         </div>
                         <div className="col-auto">
                              <input type="date" id="endDate" name="endDate" onChange={handleFilterChange} className="form-control form-control-sm mx-2" /> {/* Bootstrap form-control */}
                         </div>
                         <div className="col-auto">
                              <label htmlFor="statusFilter" className="col-form-label">Status:</label>
                         </div>
                         <div className="col-auto">
                              <select id="statusFilter" name="status" onChange={handleFilterChange} className="form-select form-select-sm mx-2"> {/* Bootstrap form-select */}
                                   <option value=''>All Statuses</option>
                                   <option value='approved'>Approved</option>
                                   <option value='rejected'>Rejected</option>
                                   <option value='requested'>Requested</option> {/* Assuming 'requested' is a valid status value for the API */}
                              </select>
                         </div>
                         <div className="col-auto">
                              <label htmlFor="categoryFilter" className="col-form-label">Category:</label>
                         </div>
                         <div className="col-auto">
                              <select 
                                   id="categoryFilter"
                                   name="categoryId" 
                                   value={filter.categoryId}
                                   onChange={handleFilterChange} 
                                   className="form-select form-select-sm mx-2" /* Bootstrap form-select */
                              >
                                   <option value="">All Categories</option>
                                   {filterableCategories.map(category => (
                                        <option key={category.id} value={category.id}>
                                             {category.name}
                                        </option>
                                   ))}
                              </select>
                         </div>
                         {/* <div className="col-auto">
                              <button className="btn btn-primary btn-sm"> 
                                   Search 
                              </button>
                         </div> */}
                         {/* Search button removed as filtering is applied on change */}
                    </div>
               </section>
               <div className="alert alert-info p-2 col-md-4"> {/* Using Bootstrap alert for info message */}
                    User Requested Expenses
               </div>
                <PrimeTable 
                    handleSeverSideProcessing={null} // This might need to be implemented if pagination/sorting is server-side
                    column={columns} 
                    data={expenses || []} 
                    serverSideFiltering={true} // This implies filters are handled by backend
                    filtering={false} // PrimeTable internal filtering disabled
                />
                {/* Basic Pagination (if needed, PrimeTable might have its own) */}
                {/* <Pagination>
                    <Pagination.Prev onClick={() => updatePage(filter.page - 1)} disabled={filter.page === 1} />
                    <Pagination.Item>{filter.page}</Pagination.Item>
                    <Pagination.Next onClick={() => updatePage(filter.page + 1)} />
                </Pagination> */}
         </div>
     )
}