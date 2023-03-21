import React from 'react'
import SidebarFrontPage from '../components/frontpagesidebar'
import Header from '../components/header'

export default function DefaultLayout({ children }) {
 return (
  <div>
   <Header/>
   <div className="wrapper">
    <div className="side">
     <SidebarFrontPage/>
    </div>
    <div className="main" >
     {children}
    </div>
   </div>
  </div>
 )
}
