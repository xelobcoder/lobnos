export default function RackQuickView(id) {
  return (
    <>
      <div className="col-6 d-flex">
        <input className="custom-input mx-2" placeholder="search for item location in shelves" type="text" />
        <button className="btn btn-primary btn-sm">
          search
        </button>
      </div>
    </>
   )
}