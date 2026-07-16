"use client";

import React from "react";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import UndeliveredResultTable from "../../../../components/operations/Laboratory/UndeliveredResultTable";

export default function UndeliveredPage() {
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings;

     return (
          <div className="container-fluid p-2">
               <UndeliveredResultTable employeeid={user?.employeeid} />
          </div>
     );
}
