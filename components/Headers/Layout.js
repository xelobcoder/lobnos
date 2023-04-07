import React, { useContext } from 'react';
import AuthContext from '../Auth/useAuthentification';
import LoginCredentials from '../../pages/Authentication/login';
import { Button } from '@mui/material';
import { useRouter } from 'next/router';
export default function MAIN_LAYOUT({ children }) {
  // get user from local storage
  
  const { auth } = useContext(AuthContext);
  const router = useRouter();
  // if access token is null or undefined, redirect to login page
  return (
    <>
      {
        auth != undefined ? (
          <div auth={auth}>
            {children}
          </div>
        )
          : (
            <LoginCredentials />
          )
      }
    </>
  )
}
