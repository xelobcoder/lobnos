import { Link } from '../types';
import {
     RiMoneyDollarCircleLine,
     RiCalendarLine,
     RiUserLine,
     RiFileListLine,
     RiHistoryLine,
     RiSettings3Line,
     RiCheckboxCircleLine,
     RiLockLine,
     RiBankCardLine,
     RiCalendarEventLine,
     RiTimeLine,
     RiBarChartBoxLine,
     RiStackLine,
     RiShieldCheckLine,
     RiAwardLine
} from '@remixicon/react';

export const PayrollLinks: Link[] = [
     {
          title: "Overview",
          link: "/human-resource/payroll",
          icon: <RiMoneyDollarCircleLine size={20} />
     },
     {
          title: "Payroll Periods",
          link: "/human-resource/payroll/periods",
          icon: <RiCalendarLine size={20} />,
          children: [
               {
                    title: "All Periods",
                    link: "/human-resource/payroll/periods",
                    icon: <RiFileListLine size={18} />
               },
               {
                    title: "Create Period",
                    link: "/human-resource/payroll/periods/create",
                    icon: <RiCalendarLine size={18} />
               },
               {
                    title: "Process Payroll",
                    link: "/human-resource/payroll/periods/process",
                    icon: <RiCheckboxCircleLine size={18} />
               },
               {
                    title: "Reverse Payments",
                    link: "/human-resource/payroll/periods/reverse-payrol-payments",
                    icon: <RiLockLine size={18} />
               }
          ]
     },
     {
          title: "Compensation",
          link: "/human-resource/payroll/compensation",
          icon: <RiBankCardLine size={20} />,
          children: [
               {
                    title: "All Compensations",
                    link: "/human-resource/payroll/compensation",
                    icon: <RiFileListLine size={18} />
               },
               {
                    title: "Salary Templates",
                    link: "/human-resource/payroll/salary-templates",
                    icon: <RiBankCardLine size={18} />
               },
               {
                    title: "Create Compensation",
                    link: "/human-resource/payroll/compensation/create",
                    icon: <RiBankCardLine size={18} />
               },
               {
                    title: "Active Compensations",
                    link: "/human-resource/payroll/compensation/active",
                    icon: <RiCheckboxCircleLine size={18} />
               }
          ]
     },
     {
          title: "Attendance",
          link: "/human-resource/payroll/attendance",
          icon: <RiCalendarEventLine size={20} />,
          children: [
               {
                    title: "All Records",
                    link: "/human-resource/payroll/attendance",
                    icon: <RiFileListLine size={18} />
               },
               {
                    title: "Record Attendance",
                    link: "/human-resource/payroll/attendance/create",
                    icon: <RiTimeLine size={18} />
               },
               {
                    title: "Attendance Summary",
                    link: "/human-resource/payroll/attendance/summary",
                    icon: <RiCheckboxCircleLine size={18} />
               }
          ]
     },
     {
          title: "Salary Grades",
          link: "/human-resource/payroll/salary-grades",
          icon: <RiBarChartBoxLine size={20} />,
          children: [
               {
                    title: "All Grades",
                    link: "/human-resource/payroll/salary-grades",
                    icon: <RiFileListLine size={18} />
               },
               {
                    title: "Create Grade",
                    link: "/human-resource/payroll/salary-grades/create",
                    icon: <RiBarChartBoxLine size={18} />
               }
          ]
     },
     {
          title: "Tax Configurations",
          link: "/human-resource/payroll/tax-configurations",
          icon: <RiSettings3Line size={20} />,
          children: [
               {
                    title: "All Configurations",
                    link: "/human-resource/payroll/tax-configurations",
                    icon: <RiFileListLine size={18} />
               },
               {
                    title: "Ghana Payroll Setup",
                    link: "/human-resource/payroll/ghana-setup",
                    icon: <RiSettings3Line size={18} />
               },
               {
                    title: "Create Configuration",
                    link: "/human-resource/payroll/tax-configurations/create",
                    icon: <RiSettings3Line size={18} />
               },
               {
                    title: "Tax Reliefs",
                    link: "/human-resource/payroll/tax-reliefs",
                    icon: <RiShieldCheckLine size={18} />
               }
          ]
     },
     {
          title: "Employee Payroll",
          link: "/human-resource/payroll/employee/history",
          icon: <RiUserLine size={20} />,
          children: [
               {
                    title: "Payroll History",
                    link: "/human-resource/payroll/employee/history",
                    icon: <RiHistoryLine size={18} />
               },
               {
                    title: "Leave Management",
                    link: "/human-resource/payroll/leave",
                    icon: <RiCalendarEventLine size={18} />
               },
               {
                    title: "Other Deductions",
                    link: "/human-resource/payroll/deductions/other",
                    icon: <RiFileListLine size={18} />
               },
               {
                    title: "Allowances",
                    link: "/human-resource/payroll/allowance",
                    icon: <RiBankCardLine size={18} />
               },
               {
                    title: "Employee Bonuses",
                    link: "/human-resource/payroll/bonuses",
                    icon: <RiAwardLine size={18} />
               },
               {
                    title: "Deduction Definitions",
                    link: "/human-resource/payroll/deduction-definitions",
                    icon: <RiStackLine size={18} />
               },
               {
                    title: "YTD Reports",
                    link: "/human-resource/payroll/employee/ytd",
                    icon: <RiFileListLine size={18} />
               }
          ]
     }
];
