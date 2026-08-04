"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PersonalInfomationRegistration from '../../../../../components/registration/PersonalInfomationRegistration';
import { customFetch } from '../../../../../components/Auth/customFetch';

export default function PagePersonalInformation() {

     return (
          <div className="container-fluid px-4 py-3">
               <PersonalInfomationRegistration />
          </div>
     );
}
