import React from 'react';
import { Alert, AlertTitle, Button } from '@mui/material';
import Link from 'next/link';
import CheckIcon from '@mui/icons-material/Check';
import { useRouter } from 'next/router';
export default function Widget({ show ,handleClickedLink}) {
  const pagesList = [
    {
      title: 'Registration',
      Link: '/registration'
    },
    {
      title: 'Activation',
      Link: '/activation'
    }
    ,
    {
      title: 'inventory',
      Link: '/inventory'
    }
    ,
    {
      title: 'suppliers',
      Link: '/supplier'
    }
    ,
    {
      title: 'phelobotomy',
      Link: '/phelobotomy'
    }
   
    ,
    {
      title: 'samples',
      Link: '/sample'
    },
    {
      title: 'billed clients',
      Link: '/billing/billedclients'
    }
    ,
    {
      title: 'Operations',
      Link: '/operations'
    }
    ,
    {
      title: 'settings',
      Link: '/settings'
    }
    ,
    {
      title: 'Approvals',
      Link: '/administration/approval'
    }
   
    ,
    {
      title: 'Results',
      Link: '/registration/ready'
    }

    ,
    {
      title: 'payments',
      Link: '/billing/payment'
    }

    ,
    {
      title: 'Dashboard',
      Link: '/billing/payment/sales'
    }

    ,
    {
      title: 'Organization',
      Link: '/organization'
    }
    ,
    {
      title: 'Clinician',
      Link: '/clinician'
    }

    ,
    {
      title: 'Appointment',
      Link: '/appointment'
    },
    {
      title: 'Authentication',
      Link: '/authentication/register'
    }


  ]

  const router = useRouter();
  return (
    <div>
      {
        show === true ?
          (<div className='custom-navigation'>
            {
              pagesList.map((item, index) => {
                return (
                  <div key={index} id='list' >
                    <Alert severity={'success'}>
                      <AlertTitle>
                        <h3>{item.title}</h3>
                      </AlertTitle>
                     <strong>
                      <Button 
                        onClick={
                          (ev) => {
                            handleClickedLink();
                            router.push(item.Link)
                          }
                        }
                      variant='contained' color='success' >
                        open page
                      </Button>
                     </strong>
                    </Alert>
                  </div>
                )
              })
            }
          </div>
          ) : null
      }
    </div>
  )
}
