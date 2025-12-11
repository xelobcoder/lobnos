"use client";

import React from 'react';
import ContactCompleteness from '../../../../components/analytics/patients-analytics/components/ContactCompleteness';

export default function ContactCompletenessPage() {
     return (
          <div className="container-fluid py-4">
               <div className="row">
                    <div className="col-12">
                         <ContactCompleteness />
                    </div>
               </div>
          </div>
     );
}