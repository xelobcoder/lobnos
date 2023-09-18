import React from 'react';
import { Alert, AlertTitle, Button } from '@mui/material';
import Link from 'next/link';
import CheckIcon from '@mui/icons-material/Check';
import { useRouter } from 'next/router';
import { AppRegistration, Approval, Inventory, SupportAgent } from '@mui/icons-material';
export default function Widget({ show, handleClickedLink }) {
  const pagesList = [
    {
      title: 'Registration',
      Link: '/registration',
      icon: <AppRegistration />
    },
    {
      title: 'Activation',
      Link: '/activation',
    },
    {
      title: 'phelobotomy',
      Link: '/phelobotomy'
    },
    {
      title: 'samples',
      Link: '/sample'
    },
    {
      title: 'Operations',
      Link: '/operations'
    }
    ,
    {
      title: 'Approvals',
      Link: '/administration/approval'
    },
    {
      title: 'Results',
      Link: '/registration/ready'
    },
    {
      title: 'payments',
      Link: '/billing/payment'
    },
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
      title: 'billed clients',
      Link: '/billing/billedclients'
    }

    ,
    {
      title: 'settings',
      Link: '/settings'
    },
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
    },
    {
      title: 'patients Records',
      Link: '/patients'
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
                    <div className='items'>
                      <div className='text'> {item.title}</div>
                      <div>
                        <Button
                          size='small'
                          variant='contained'
                          onClick={
                            (ev) => {
                              handleClickedLink();
                              router.push(item.Link)
                            }
                          }
                        >
                          open
                        </Button>
                      </div>
                    </div>
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
