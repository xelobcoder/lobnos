const columns = [
  {
    Header: 'Date',
    accessor: 'date',
    Cell: ({ value }) => <span>{value.slice(0, 10)}</span>
  },
  {
    Header: 'Patient ID',
    accessor: 'patientid',
    Cell:  ({value}) => <div onClick={(e) => setQueryState({...querystate,patientid: value})}>
      {value}
    </div>
  },
  {
    Header: 'Billing ID',
    accessor: 'billingid',
  },
  {
    Header: 'Amount Due',
    accessor: 'payable',
    Cell: ({ value }) => <span> {value}</span>
  },
  {
    Header: 'Paid Amount',
    accessor: 'paid_amount',
  },
  {
    Header: 'Outstanding',
    accessor: 'outstanding',
    Cell: ({ value, row }) => (
      <div
        style={{
          backgroundColor: value > 0 ? 'red' : 'none',
          color: value > 0 ? 'white' : 'black'
        }}
        {...row.getRowProps()}
        className={value > 0 ? 'red-border-row' : ''}
      >
        {value}
      </div>
    )
  },
]

export default columns;