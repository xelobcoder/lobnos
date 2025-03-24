export default function Sampling({ data, colorIndex }) {
  return (
    <div className={`my-2 border br-5 pointer`} style={{display:'grid',gridTemplateColumns:'100%',fontSize:'14px'}}>
      <span  className='modal-color p-2  text-capitalize lims-text-color border-bottom fw-bold'> {data.title}</span>
      <span className='text-center bg-white fw-bold border-bottom' style={{ fontSize: '40px' }}>{data.value}</span>
    </div>
  );
}
