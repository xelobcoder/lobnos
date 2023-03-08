import { Container, TextField, Button, Autocomplete } from '@mui/material'
import { useState, useCallback, useEffect } from 'react'
import parameter from './countparameter';

function FullBloodCountSetup() {
  const [fullcount, setFullcount] = useState(parameter)
  const [category, setCategory] = useState('male')
  const [childrenAge, setChildrenAge] = useState('0-10')
  const [disable, setDisabled] = useState(true)
  const [mode, setmode] = useState('new')

  const onChangeUnit = (e, index) => {
    setFullcount(prevState => {
      return [...prevState.slice(0, index), { ...prevState[index], UNIT: e.target.value }, ...prevState.slice(index + 1)]
    })
  }
  const onChangeLower = (e, index) => {
    setFullcount(prevState => {
      return [...prevState.slice(0, index), { ...prevState[index], LOWER: e.target.value }, ...prevState.slice(index + 1)]
    }
    )
  }
  const onChangeUpper = (e, index) => {
    setFullcount(prevState => {
      return [...prevState.slice(0, index), { ...prevState[index], UPPER: e.target.value }, ...prevState.slice(index + 1)]
    }
    )
  }


  const saveData = function (e) {
    const endpoint = 'http://localhost:5000/api/test/setup/fbc';
    const getdata = async function () {
      let api = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ setupdata: fullcount, setup: 'FBC', category })
      })
      let response = await api.json();
      return response;
    }

    getdata()
      .then((_res) => {
      })
      .catch((_err) => {
      })
  }


  const category_data_fill = function (e) {
    let v = e.target.value;

    setCategory(v)
    // get the data based on the category
  }
  // select options for savin g data im terms of male,female,children


  useEffect(() => {
    if (category) {
      const getdata = async function () {
        let api = await fetch(`http://localhost:5000/api/test/setup/fbc?category=${category}`)
        let response = await api.json();
        response.length > 0 ? setFullcount(response) : setFullcount(parameter)
      }


      getdata();
    }
  }, [category])




  const Category = function (props) {
    return (
      <>
        <div className='top_cart'>
          <div className='form-group'>
            <label>category</label>
            <select value={category} onChange={(e) => { category_data_fill(e) }} className='form-control'>
              <option value='male'>male</option>
              <option value='female'>female</option>
              <option value='children'>children</option>
            </select>
          </div>
          <div className='form-group'>
            <label>children age range</label>
            <input className='form-control' value={childrenAge} disabled={disable}></input>
          </div>
        </div>
      </>
    )
  }






  return (
    <>
      <div className='_fbc'>
        <Category ctx='0-10' />
        <div className='wrapperx'>
          <div className='fbc_header'>
            <ul>
              <li>parameter name</li>
              <li>unit</li>
              <li>upper</li>
              <li>lower</li>
            </ul>
          </div>
          <div className='fbc_header'>
            <div className='parameter-list'>
              {
                fullcount.length == 0 ? null : fullcount.map((item, index) => {
                  return (
                    <ul key={index}>
                      <li>{item.PARAMETER}</li>
                      <li>
                        <input value={item.UNIT} type='text' onChange={(e) => onChangeUnit(e, index)} />
                      </li>
                      <li>
                        <input value={item.UPPER} type='number' onChange={(e) => onChangeUpper(e, index)} />
                      </li>
                      <li>
                        <input value={item.LOWER} type='number' onChange={(e) => onChangeLower(e, index)} />
                      </li>
                    </ul>
                  )
                })
              }
            </div>
          </div>
        </div>
        <div className='fbc_header' style={{ display: "flex", justifyContent: 'right' }} >
          <Button variant='contained' color='success'
            onClick={(e) => saveData(e)}
          >
            {/* if new entry button dispaly save changes, else update */}
            {
              mode === 'new' ? 'save changes' : 'update changes'
            }
          </Button>
        </div>
      </div>
    </>
  )
}

export default FullBloodCountSetup
