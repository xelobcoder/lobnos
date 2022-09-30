import React from 'react';
import style from '../../styles/sample.module.css';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import UpcomingIcon from '@mui/icons-material/Upcoming';
import DraftsIcon from '@mui/icons-material/Drafts';
import AddRoadIcon from '@mui/icons-material/AddRoad';
import AddToQueueIcon from '@mui/icons-material/AddToQueue';


export default function PHELOBOTOMY_LANDING_PAGE() {
 return (
  <div className={style.sample_sidebar}>
   <ul>
    <li><AddShoppingCartIcon /> taken</li>
    <li><AddToQueueIcon /> rejected</li>
    <li><UpcomingIcon /> queue</li>
    <li><DraftsIcon /> messages</li>
    <li><AddToQueueIcon /> notifications</li>
   </ul>
  </div>
 )
}
