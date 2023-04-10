import React from 'react';
import { TestPanelProvider } from '../../components/testpanel/contextTest';
import TestPanelLayout from '../../components/testpanel/TestPanelLayout';
import { customFetch } from '../../components/Auth/customFetch';
import { Suspense } from 'react';
import { Button } from '@mui/material';

export default function CATEGORIES({ data }) {
  return (
    <div>
      <TestPanelProvider>
        <TestPanelLayout>
          <Suspense>
            <div className='list-group' id='categories-list-wrapper'>
              {data.map((item, index) => {
                return (
                  <div key={index} className='list-group-item group-grid'>
                    <h6>{item.ID}</h6>
                    <h6>{item.CATEGORY}</h6>
                    <h6>{item.DESCRIPTION}</h6>
                    <div>
                      <Button>
                        edit
                      </Button>
                      <Button color='error'>
                        Delete
                      </Button>
                    </div>
                  </div>)
              })}
            </div>
          </Suspense>
        </TestPanelLayout>
      </TestPanelProvider>
    </div>
  )
}



export async function getServerSideProps(context) {
  const categories = await customFetch('testpanel/categories');
  const response = Array.isArray(categories) && categories.length > 0 ? categories : []


  return {
    props: {
      data: response
    }
  }
}