import {useRef,useEffect} from 'react';






export default function Table(props) {
    const $ = require('jquery')

    $.DataTable = require('datatables.net')
    const tableRef = useRef();
    // console.log(tableRef)
    const tableName = "table1"

    console.log(props.data)
    useEffect(() => {
        console.log(tableRef.current)
        const table = $(tableRef.current).DataTable(
            {
                data: props.data,
                    columns: [
                        { data: "albumId",
                            title: "Album ID" },
                        { data: "id",
                            title: "ID" },
                        { data: "title",
                            title: "Title" },
                        { data: "url",
                            title: "URL" },
                        { data: "thumbnailUrl",
                            title: "Thumbnail URL" },
                    ],
                    destroy: false,
                    paging: true,
            }
        )
        // Extra step to do extra clean-up.
        return function() {
            console.log("Table destroyed")
            table.destroy()
        }
    },[])
        return (
            <div className='p-5'>
                <h1>hello </h1>
                <table  id={tableName} className="display p-3 mt-5"  width="100%" ref={tableRef}></table>
            </div>
             
        )
}