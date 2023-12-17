export default function EmailLogList({ data }) {
  console.log(data)
  return (
    <div className="list-group mx-2">
       <div className='list-group-item grid text-capitalize' style={{ display: 'grid', gridTemplateColumns: '5% 20% 30% 10% 10% auto',backgroundColor:'whitesmoke' }}>
              <span className='fw-bold text-md-start'>#</span>
              <span className='fw-bold text-md-start'>Date</span>
              <span className='fw-bold text-md-start'>Subject</span>
              <span className='fw-bold text-md-start'>billingid</span>
              <span className='fw-bold text-md-start'>status</span>
              <span className='fw-bold text-md-start'>reason for failure</span>
              </div>
      {
        data.map((item, index) => (
          <div key={index} className={`list-group-item grid`} style={{display:'grid',gridTemplateColumns:'5% 20% 30% 10% 10% auto'}}>
            <span>{item.id}</span>
            <span>{ new Date(item?.date).toLocaleDateString()}</span>
            <span >{item?.type}</span>
            <span>{item?.target}</span>
            <span className={item?.success == 1 ? "br-5 bg-success text-center fw-bold text-white" : "br-5 bg-danger text-center fw-bold text-white"}>
              {item.success === 1 ? "success" : "failed"}
            </span>
            <span className="mx-3"> 
              {item.reason}
            </span>
          </div>
        ))
      }
    </div>
  );
}