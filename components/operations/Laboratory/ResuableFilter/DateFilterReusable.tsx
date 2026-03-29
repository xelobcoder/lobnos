import React from 'react'
import dayjs from 'dayjs'

interface DateFilterReusableProps {
     value: string;
     onChange: (value: string) => void;
     onDateRangeChange?: (startDate: string, endDate: string) => void;
     label?: string;
     className?: string;
     disabled?: boolean;
}

const CUSTOM_RANGE_VALUE = 'Custom Range';

const DATE_FILTER_GROUPS = (labelText: string) => ({
     '': [{ value: '', label: labelText }],
     'Daily': [
          { value: 'Today', label: 'Today' },
          { value: 'Yesterday', label: 'Yesterday' },
     ],
     'Weekly': [
          { value: 'This Week', label: 'This Week' },
          { value: 'last week', label: 'Last Week' },
          { value: 'last 7 days from now', label: 'Last 7 Days' },
          { value: 'last 14 days', label: 'Last 14 Days' },
          { value: 'last 21 days', label: 'Last 21 Days' },
     ],
     'Monthly': [
          { value: 'This Month', label: 'This Month (MTD)' },
          { value: 'last month', label: 'Last Month' },
          { value: 'last 30 Days', label: 'Last 30 Days' },
          { value: 'last 2 months', label: 'Last 2 Months' },
          { value: 'last 3 months', label: 'Last 3 Months' },
          { value: 'last 60 Days', label: 'Last 60 Days' },
          { value: 'last 90 Days', label: 'Last 90 Days' },
     ],
     'Quarterly': [
          { value: 'this quarter', label: 'This Quarter (QTD)' },
          { value: 'last quarter', label: 'Last Quarter' },
          { value: 'last 2 quarters', label: 'Last 2 Quarters' },
     ],
     'Yearly': [
          { value: 'This Year', label: 'This Year (YTD)' },
          { value: 'last Year', label: 'Last Year' },
          { value: 'last 2 years', label: 'Last 2 Years' },
          { value: 'last 3 years', label: 'Last 3 Years' },
          { value: 'last 6 months', label: 'Last 6 Months' },
          { value: 'last 12 months', label: 'Last 12 Months' },
          { value: 'last 365 Days', label: 'Last 365 Days' },
     ],
     'Fiscal': [
          { value: 'This Fiscal Year', label: 'This Fiscal Year' },
          { value: 'Last Fiscal Year', label: 'Last Fiscal Year' },
     ],
     'All': [
          { value: 'All', label: 'All Time' },
     ],
     'Custom': [
          { value: CUSTOM_RANGE_VALUE, label: 'Custom Range' },
     ],
});

const calculateDateRange = (filterValue: string) => {
     let startDate = dayjs().format('YYYY-MM-DD');
     let endDate = dayjs().format('YYYY-MM-DD');

     switch (filterValue) {
          case 'Today':
               startDate = dayjs().format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          case 'Yesterday':
               startDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
               endDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
               break;
          case 'This Week':
               startDate = dayjs().startOf('week').format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          case 'last week':
               startDate = dayjs().subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
               endDate = dayjs().subtract(1, 'week').endOf('week').format('YYYY-MM-DD');
               break;
          case 'This Month':
               startDate = dayjs().startOf('month').format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          case 'last month':
               startDate = dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
               endDate = dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
               break;
          case 'This Year':
               startDate = dayjs().startOf('year').format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          case 'last Year':
               startDate = dayjs().subtract(1, 'year').startOf('year').format('YYYY-MM-DD');
               endDate = dayjs().subtract(1, 'year').endOf('year').format('YYYY-MM-DD');
               break;
          case 'last 7 days from now':
               startDate = dayjs().subtract(7, 'days').format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          case 'last 14 days':
               startDate = dayjs().subtract(14, 'days').format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          case 'last 21 days':
               startDate = dayjs().subtract(21, 'days').format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          case 'last 30 Days':
               startDate = dayjs().subtract(30, 'days').format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          case 'last 60 Days':
               startDate = dayjs().subtract(60, 'days').format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          case 'last 90 Days':
               startDate = dayjs().subtract(90, 'days').format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          case 'last 2 months':
               startDate = dayjs().subtract(2, 'months').format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          case 'last 3 months':
               startDate = dayjs().subtract(3, 'months').format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          case 'last 365 Days':
               startDate = dayjs().subtract(365, 'days').format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          case 'last 2 years':
               startDate = dayjs().subtract(2, 'years').format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          case 'last 3 years':
               startDate = dayjs().subtract(3, 'years').format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          case 'This Fiscal Year':
               // Assuming fiscal year starts April 1st
               const currentMonth = dayjs().month();
               const fiscalStart = currentMonth >= 3 ? dayjs().month(3).startOf('month') : dayjs().subtract(1, 'year').month(3).startOf('month');
               startDate = fiscalStart.format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          case 'Last Fiscal Year':
               // Last fiscal year ends March 31st
               const lastFiscalEnd = dayjs().month(2).endOf('month');
               const lastFiscalStart = lastFiscalEnd.subtract(1, 'year').month(3).startOf('month');
               startDate = lastFiscalStart.format('YYYY-MM-DD');
               endDate = lastFiscalEnd.format('YYYY-MM-DD');
               break;
          case 'this quarter':
               const currentQuarter = Math.floor(dayjs().month() / 3);
               startDate = dayjs().month(currentQuarter * 3).startOf('month').format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          case 'last quarter':
               const lastQuarter = Math.floor(dayjs().subtract(3, 'months').month() / 3);
               startDate = dayjs().subtract(3, 'months').month(lastQuarter * 3).startOf('month').format('YYYY-MM-DD');
               endDate = dayjs().subtract(3, 'months').month(lastQuarter * 3 + 2).endOf('month').format('YYYY-MM-DD');
               break;
          case 'last 2 quarters':
               startDate = dayjs().subtract(6, 'months').format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          case 'last 6 months':
               startDate = dayjs().subtract(6, 'months').format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          case 'last 12 months':
               startDate = dayjs().subtract(12, 'months').format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          case 'All':
               startDate = dayjs().subtract(100, 'years').format('YYYY-MM-DD');
               endDate = dayjs().format('YYYY-MM-DD');
               break;
          default:
               break;
     }

     return { startDate, endDate };
};

export default function DateFilterReusable({
     value,
     onChange,
     onDateRangeChange,
     label = 'Filter by',
     className = 'col-12 col-lg-2',
     disabled = false
}: DateFilterReusableProps) {
     const [customStartDate, setCustomStartDate] = React.useState(dayjs().startOf('month').format('YYYY-MM-DD'));
     const [customEndDate, setCustomEndDate] = React.useState(dayjs().format('YYYY-MM-DD'));

     const handleChange = (filterValue: string) => {
          onChange(filterValue);
          if (onDateRangeChange) {
               if (filterValue === CUSTOM_RANGE_VALUE) {
                    onDateRangeChange(customStartDate, customEndDate);
                    return;
               }
               const { startDate, endDate } = calculateDateRange(filterValue);
               onDateRangeChange(startDate, endDate);
          }
     };

     const handleCustomStartDateChange = (startDate: string) => {
          setCustomStartDate(startDate);
          if (onDateRangeChange) {
               onDateRangeChange(startDate, customEndDate);
          }
     };

     const handleCustomEndDateChange = (endDate: string) => {
          setCustomEndDate(endDate);
          if (onDateRangeChange) {
               onDateRangeChange(customStartDate, endDate);
          }
     };

     return (
          <div className={className}>
               <select
                    className="form-select"
                    value={value}
                    onChange={(ev) => handleChange(ev.target.value)}
                    disabled={disabled}
               >
                    {Object.entries(DATE_FILTER_GROUPS(label)).map(([groupLabel, options]) =>
                         groupLabel === '' ? (
                              options.map((option) => (
                                   <option key={option.value} value={option.value}>
                                        {option.label}
                                   </option>
                              ))
                         ) : (
                              <optgroup key={groupLabel} label={groupLabel}>
                                   {options.map((option) => (
                                        <option key={option.value} value={option.value}>
                                             {option.label}
                                        </option>
                                   ))}
                              </optgroup>
                         )
                    )}
               </select>
               {value === CUSTOM_RANGE_VALUE && (
                    <div className="d-flex gap-2 mt-2">
                         <input
                              type="date"
                              className="form-control form-control-sm"
                              value={customStartDate}
                              onChange={(ev) => handleCustomStartDateChange(ev.target.value)}
                              disabled={disabled}
                              aria-label="Custom range start date"
                         />
                         <input
                              type="date"
                              className="form-control form-control-sm"
                              value={customEndDate}
                              min={customStartDate}
                              onChange={(ev) => handleCustomEndDateChange(ev.target.value)}
                              disabled={disabled}
                              aria-label="Custom range end date"
                         />
                    </div>
               )}
          </div>
     )
}
