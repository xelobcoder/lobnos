export default function ShowTableCount({ queryParams, setQueryParams }) {
       return (
              <div className="my-1 col-12 col-sm-6 col-md-4 col-lg-3">
                     <select
                            value={queryParams.count}
                            onChange={(ev) => setQueryParams({ ...queryParams, count: ev.target.value })}
                            className="custom-select"
                     >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                            <option value={25}>25</option>
                            <option value={30}>30</option>
                            <option value={35}>35</option>
                            <option value={40}>40</option>
                            <option value={45}>45</option>
                            <option value={50}>50</option>
                     </select>
              </div>
       );
}
