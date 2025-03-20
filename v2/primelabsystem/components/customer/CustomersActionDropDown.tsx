import React from 'react';
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface CustomersActionsProps {
  item: {
    patientid: string;
    activation_status: string;
  };
  callActivation: (status: string, patientId: string, toast: any) => void;
  gotoPrevTrans: (patientId: string) => void;
  toast: any;
  router: any;
  handleBilling: (item: any) => void;
}

const CustomersActions: React.FC<CustomersActionsProps> = ({ 
  item, 
  callActivation, 
  gotoPrevTrans, 
  toast, 
  router, 
  handleBilling 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem
          onClick={() => callActivation(item.activation_status, item.patientid, toast)}
          className="flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 mr-2">
            <path d="M7 10H20C20.5523 10 21 10.4477 21 11V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V11C3 10.4477 3.44772 10 4 10H5V9C5 5.13401 8.13401 2 12 2C14.7405 2 17.1131 3.5748 18.2624 5.86882L16.4731 6.76344C15.6522 5.12486 13.9575 4 12 4C9.23858 4 7 6.23858 7 9V10ZM5 12V20H19V12H5ZM10 15H14V17H10V15Z" />
          </svg>
          <span className="capitalize">Activate Client</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => callActivation(item.activation_status, item.patientid, toast)}
          className="flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 mr-2">
            <path d="M19 10H20C20.5523 10 21 10.4477 21 11V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V11C3 10.4477 3.44772 10 4 10H5V9C5 5.13401 8.13401 2 12 2C15.866 2 19 5.13401 19 9V10ZM5 12V20H19V12H5ZM11 14H13V18H11V14ZM17 10V9C17 6.23858 14.7614 4 12 4C9.23858 4 7 6.23858 7 9V10H17Z" />
          </svg>
          <span className="capitalize">Deactivate Client</span>
        </DropdownMenuItem>

        {/* Continue with other menu items following the same pattern */}
        <DropdownMenuItem
          onClick={() => router.push(`/registration?patientid=${item.patientid}`)}
          className="flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 mr-2">
            <path d="M14 14.252V16.3414C13.3744 16.1203 12.7013 16 12 16C8.68629 16 6 18.6863 6 22H4C4 17.5817 7.58172 14 12 14C12.6906 14 13.3608 14.0875 14 14.252ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11ZM18.5858 17L16.7574 15.1716L18.1716 13.7574L22.4142 18L18.1716 22.2426L16.7574 20.8284L18.5858 19H15V17H18.5858Z" />
          </svg>
          <span className="capitalize">Update Records</span>
        </DropdownMenuItem>

        {/* Add remaining menu items with the same pattern */}
        
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomersActions;