import React ,{useState} from 'react';
import CustomAutocompleteList from '../components/accessories/AutoComplete';
import AutoCompleteObject from '../components/accessories/AutoCompleteObject';




export default function AutocompleteForm() {
  const [selected,setSelected] = useState({country:'Ghana',name:'',code:''});
  const [inputValue, setInputValue] = useState('');

  const handleSelected = (selected) => {
    setSelected(selected);
    setInputValue(selected[options.target]);
  }

  const options =  {
    tabindex: 1,
    filter: 'contains',
    target: 'name',
    placeholder: 'Search for a state',
    data:[
      { country: 'USA', name: 'Alabama', code: 'AL' },
      { country: 'USA', name: 'Alaska', code: 'AK' },
      { country: 'USA', name: 'Arizona', code: 'AZ' },
      { country: 'USA', name: 'Washington', code: 'W' },
      { country: 'USA', name: 'West Virginia', code: 'WV' },
      { country: 'USA', name: 'Wisconsin', code: 'WI' },
      { country: 'USA', name: 'Wyoming', code: 'WY' },
      { country: 'USA', name: 'Alabama', code: 'AL' },
      { country: 'USA', name: 'Alaska', code: 'AK' },
      { country: 'USA', name: 'Arizona', code: 'AZ' },
      { country: 'USA', name: 'Washington', code: 'W' },
      { country: 'USA', name: 'West Virginia', code: 'WV' },
      { country: 'USA', name: 'Wisconsin', code: 'WI' },
      { country: 'USA', name: 'Wyoming', code: 'WY' },
      { country: 'USA', name: 'Alabama', code: 'AL' },
      { country: 'USA', name: 'Alaska', code: 'AK' },
      { country: 'USA', name: 'Arizona', code: 'AZ' },
      { country: 'USA', name: 'Washington', code: 'W' },
      { country: 'USA', name: 'West Virginia', code: 'WV' },
      { country: 'USA', name: 'Wisconsin', code: 'WI' },
      { country: 'USA', name: 'Wyoming', code: 'WY' }
    ],
    inputValue: inputValue,
    setInputValue: setInputValue,
    selected: selected,
    handleSelected: handleSelected,
  }
  
 
  

  

  return (
    <>
      <div className='col-8'>
       <AutoCompleteObject options={options}/>
      </div>
    </>
  )
}


