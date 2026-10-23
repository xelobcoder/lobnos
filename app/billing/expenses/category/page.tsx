"use client"

import { RiDeleteBin2Fill } from "@remixicon/react";;
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Loader from "../../../../components/accessories/Loader";
import { customPost,customFetch } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import styles from '../../../../styles/SmsTemplateList.module.css'


export default function ExpenseCategoryCreation() {
     const [loading, setLoading] = useState(false);
     const [category, setCategoryList] = useState<any[]>([]);
     const [newCategory, setNewCategory] = useState("");
     const [editing, setEditing] = useState(false);
     const [editid, setEditId] = useState<{ id: string | number; category: string; createdon?: string | Date } | null>(null);
     const {branchid, user } = useApplication();
     const employeeid = user?.employeeid;
     


     useEffect(() => {
          setLoading(true);
          customFetch(`expense/get/category?branchid=${branchid}&&employeeid=${employeeid}`)
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
               let categoryid: string | number | null = null;
               if (method === "PUT") {
                    categoryid = editid?.id ?? null;
               }
               const response = await customPost(`expense/new/category?branchid=${branchid}&&employeeid=${employeeid}&&category=${categoryid}`, method, { category: newCategory, editid: categoryid, employeeid ,branchid});
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
                         {Array.isArray(category) && category.length > 0 &&  category.map((item, index) => {
                              return <tr key={index}>
                                   <td>{item.category}</td>
                                   <td>{new Date(item.createdon).toLocaleDateString() || ""}</td>
                                   <td>
                                        <button onClick={(ev) => {
                                             handleEdit(item);
                                        }} className="btn btn-info btn-sm">edit</button>
                                        <button className="btn btn-danger btn-sm mx-2">
                                             <RiDeleteBin2Fill size={20} />
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
           <section>
                <label>Expense Category</label>
                <input value={newCategory} onChange={(ev) => {
                     setNewCategory(ev.target.value)
                }} type="input" className="form-control mb-2" />
                <button type="button"
                     onClick={() => { handleSaveButton() }}
                     className="btn btn-success btn-sm">new category</button>
           </section>
           <section className="table-responsive mt-3" tabIndex={0} aria-label="Expense categories">
                <table className={styles.table}>
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
