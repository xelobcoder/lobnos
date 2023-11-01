import AddBoxSharpIcon from '@mui/icons-material/AddBoxSharp';
import React, { useContext, useState, useMemo, useEffect } from 'react';
import { customFetch, customPost, getSampleTypeList, handleTestListChange,handleComments, validateFormData, handleResponse } from '../Auth/customFetch';
import { useRouter } from 'next/router';

export default function AddPanel() {
  const [categories, setCategories] = useState([]);
  const [panel, setPanel] = useState({
    NAME: '',
    PRICE: '',
    SAMPLE: '',
    QTY_REQUIRED: '',
    SAMPLE_CONTAINER: '',
    UNIT: '',
    DESCRIPTION: '',
    CATEGORY: ''
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
      <main>
        <div className="container-fluid">
          <div className="m-2 bg-white br-5">
            <header className="mb-3">
              <h4 className="btn btn-danger">update test information</h4>
            </header>
            <form>
              <div className="form-group ">
                <label> test name  <span className='badge btn btn-warning' style={{position: 'relative',top:'-20%'}}>{panel.NAME} test</span></label>
                <input
                  className="form-control"
                  value={panel.NAME}
                  type="text"
                  name="test"
                  disabled
                  onChange={(e)=>handleComments(e,panel,'NAME',setPanel)}
                  placeholder=" Test"
                />
               
              </div>
              <div className="form-group ">
                <label>price</label>
                <input
                  className="form-control"
                  type="number"
                  value={panel.PRICE}
                  name="price"
                  onChange={(e)=>handleComments(e,panel,'PRICE',setPanel)}
                  placeholder="Price"
                />
              </div>
              <div className="form-group ">
                <label>category</label>
                <select
                  className="form-control"
                  value={panel.CATEGORY}
                  name="category"
                  onChange={(e)=>handleComments(e,panel,'CATEGORY',setPanel)}
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
                  onChange={(e) => handleComments(e, panel, "SAMPLE",setPanel)}
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
                  value={panel.DESCRIPTION}
                  onChange={(e) => handleComments(e,panel,'DESCRIPTION',setPanel)}
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
                  value={panel.UNIT}
                  onChange={(e) => handleComments(e,panel,'UNIT',setPanel)}
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
                  value={panel.SAMPLE_CONTAINER}
                  onChange={(e) => handleComments(e,panel,'SAMPLE_CONTAINER',setPanel)}
                  placeholder="sample container"
                />
              </div>
              {/* sample volume */}
              <div className="form-group mt-3">
                <label>sample volume</label>
                <input
                  className="form-control"
                  type="text"
                  value={panel.QTY_REQUIRED}
                  name="samplevolume"
                  onChange={(e) => handleComments(e,panel,'QTY_REQUIRED',setPanel)}
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
      </main>
    </>
  );
}



