import React, { useEffect, useRef } from 'react';
import CustomAutocomplete from '../components/accessories/AutoComplete';


export default function AutocompleteForm() {
  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
    'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
    'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
    'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
    'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
    'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
  ];

  return (
    <>
      <div style={{ width: '40vw' }}>
        <CustomAutocomplete data={states} placeholder={'USA states '} />
        <CustomAutocomplete data={states} placeholder={'USA states '} />
        <CustomAutocomplete data={states} placeholder={'USA states '} />
      </div>
    </>
  )
}


