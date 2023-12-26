import AddBoxSharpIcon from '@mui/icons-material/AddBoxSharp';
import React, { useContext, useState, useMemo, useEffect } from 'react';
import { customFetch, customPost, getSampleTypeList, handleTestListChange,handleComments, validateFormData, handleResponse } from '../Auth/customFetch';
import { useRouter } from 'next/router';
import {ToastContainer,toast} from 'react-toastify'

export default function AddPanel() {
  const [categories, setCategories] = useState([]);
  const [panel, setPanel] = useState({
    name: '',
    price: '',
   sample: '',
   qty_required: '',
   sample_container: '',
    unit: '',
    description: '',
    category: ''
  });
  const [sampletype, setSampleType] = useState([])

  const id = useRouter().query.id;

  const getTestList = async function (id) {
    const getResponse = await customFetch(`testpanel/list?id=${id}`);
    const { data, statusCode, status } = getResponse;
    if (status == 'success' && statusCode == 200) {
      setPanel(data[0])
    }
  }



  const getCategories = async function () {
    const response = await customFetch('departments');
    const { status, statusCode, data } = response;
    if (statusCode == 200 && status == 'success') {
      setCategories(data)
    } else {
      setCategories([])
    }
  }





  useMemo(() => {
    if (id) {
      getCategories();
      getTestList(id);
      getSampleTypeList(setSampleType)
    }
  }, [id])


  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await customPost(`testpanel/list?id=${id}`,'PUT',{panel})

    handleResponse(response);

  }
  return (
    <>
      <ToastContainer/>
      <main>
        <div className="container-fluid">
          <div className='card my-2'>
          <div className="card-header">
             <div className='card-title'> update test information</div>
            </div>
            <div className='card-body'>
            <form>
              <div className="form-group ">
                <label> Test name  </label>
                <input
                  className="form-control"
                  value={panel.name}
                  type="text"
                  name="test"
                  disabled
                  onChange={(e)=>handleComments(e,panel,'name',setPanel)}
                  placeholder=" Test"
                />
               
              </div>
              <div className="form-group ">
                <label>price</label>
                <input
                  className="form-control"
                  type="number"
                  value={panel.price}
                  name="price"
                  onChange={(e)=>handleComments(e,panel,'price',setPanel)}
                  placeholder="Price"
                />
              </div>
              <div className="form-group ">
                <label>category</label>
                <select
                  className="form-control"
                  value={panel.category}
                  name="category"
                  onChange={(e)=>handleComments(e,panel,'category',setPanel)}
                >
                  <option value="">select category</option>
                  {categories.map((item, index) => (
                    <option key={index} value={item.id}>
                      {item.department}
                    </option>
                  ))}
                </select>
              </div>
              {/* sample  */}
              <div className="form-group ">
                <label>sample type</label>
                <select
                  className="form-control"
                  name="sample"
                  onChange={(e) => handleComments(e, panel, "sample",setPanel)}
                >
                    {sampletype.map((ss, ii) => {
                    return (
                      <option value={ss.id} key={ii}>
                        {ss.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              {/* description */}
              <div className="form-group ">
                <label>description</label>
                <textarea
                  className="form-control"
                  name="description"
                  rows={5}
                  value={panel.description}
                  onChange={(e) => handleComments(e,panel,'description',setPanel)}
                  placeholder="description"
                />
              </div>
              {/* unit */}
              <div className="form-group ">
                <label>unit</label>
                <input
                  className="form-control"
                  type="text"
                  name="unit"
                  value={panel.unit}
                  onChange={(e) => handleComments(e,panel,'unit',setPanel)}
                  placeholder="unit"
                />
              </div>
              {/* sample container */}
              <div className="form-group ">
                <label>sample container</label>
                <input
                  className="form-control"
                  type="text"
                  name="samplecontainer"
                  value={panel.sample_container}
                  onChange={(e) => handleComments(e,panel,'sample_container',setPanel)}
                  placeholder="sample container"
                />
              </div>
              {/* sample volume */}
              <div className="form-group mt-3">
                <label>sample volume</label>
                <input
                  className="form-control"
                  type="text"
                  value={panel.qty_required}
                  name="samplevolume"
                  onChange={(e) => handleComments(e,panel,'qty_required',setPanel)}
                  placeholder="sample volume"
                />
              </div>
              <button
                type="button"
                className=" btn btn-primary mt-3"
                onClick={handleSubmit}
              >
                <AddBoxSharpIcon />
                update test information
              </button>
            </form>
          </div>
        </div>
        </div>
      </main>
    </>
  );
}



