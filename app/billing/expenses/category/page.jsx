"use client"
import { useEffect, useState } from "react";
import { customFetch, customPost } from "../../../../components/Auth/customFetch";
import Loader from '../../../../components/accessories/Loader';
import { DeleteBinLine } from "@remixicon/react";
import { ToastContainer, toast } from "react-toastify";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";


export default function ExpenseCategoryCreation() {
     const [loading, setLoading] = useState(false);
     const [category, setCategoryList] = useState([]);
     const [newCategory, setNewCategory] = useState("");
     const [editing, setEditing] = useState(false);
     const [editid, setEditId] = useState(null);
     const { user } = useApplicationSettings().applicationsettings;
     const employeeid = user?.employeeid;


     useEffect(() => {
          setLoading(true);
          customFetch(`expense/get/category`)
               .then((data) => {
                    if (Array.isArray(data)) {
                         setCategoryList(data);
                    }
               })
               .catch((err) => { })
               .finally(() => {
                    setLoading(false);
               })
     }, []);


     const handleSaveButton = async function () {
          if (newCategory.length == 0) return;
          const method = editing === true ? 'PUT' : 'POST';
          try {
               let categoryid = null;
               if (method === "PUT") {
                    categoryid = editid?.id;
               }
               const response = await customPost(`expense/new/category`, method, { category: newCategory, editid: categoryid, employeeid });
               const { status, message, statusCode } = response;
               if (status == "success" && statusCode == 200) {
                    toast.success(message, { position: 'top-center' });
                    if (method == 'POST' && message == "category created successfully".trim()) {
                         const nArray = [...category];
                         nArray.push({ category: newCategory, createdon: new Date() })
                         setCategoryList(nArray);
                    }

               } else {
                    toast.error(message, { autoClose: 3000, position: 'top-center' });
               }

               if (method == "PUT" && status == true) {
                    toast.success('category updated successfully', { position: 'top-center' });
                    const nArray = [...category];
                    const itemIndex = nArray.findIndex((a, i) => a.id == categoryid);
                    if (itemIndex >= 0) {
                         nArray[itemIndex]['category'] = newCategory;
                         setCategoryList(nArray)
                    }
               }
          } catch (err) {
               toast.error("something wrong occured");
          }
     }



     const handleEdit = (item) => {
          setEditId(item);
          setEditing(true);
          const { category } = item;
          setNewCategory(category);
     }


     const isRenderingView = () => {
          if (loading) {
               return <Loader />
          } else {
               if (category.length > 0) {
                    return <tbody>
                         {category.map((item, index) => {
                              return <tr key={index}>
                                   <td>{item.category}</td>
                                   <td>{new Date(item.createdon).toLocaleDateString() || ""}</td>
                                   <td>
                                        <button onClick={(ev) => {
                                             handleEdit(item);
                                        }} className="btn btn-info btn-sm">edit</button>
                                        <button className="btn btn-danger btn-sm mx-2">
                                             <DeleteBinLine />
                                        </button>
                                   </td>
                              </tr>
                         })}
                    </tbody>
               } else {
                    return (
                         <tbody>
                              <tr>
                                   <td>No data found</td>
                              </tr>
                         </tbody>
                    )
               }
          }
     }

     return (
          <div>
          <ToastContainer />
           <section>
                <label>Expense Category</label>
                <input value={newCategory} onChange={(ev) => {
                     setNewCategory(ev.target.value)
                }} type="input" className="form-control mb-2" />
                <button type="button"
                     onClick={(ev) => { handleSaveButton(ev) }}
                     className="btn btn-success btn-sm">new category</button>
           </section>
           <section>
                <table className="table mt-2 ttable">
                     <thead>
                          <tr>
                               <th>category</th>
                               <th>created on</th>
                               <th>Actions</th>
                          </tr>
                     </thead>
                     {isRenderingView()}
                </table>
           </section>
          </div>
     )
}