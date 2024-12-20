"use client";
import { useEffect, useState } from "react";
import { fetchTableColumns, fetchTableSmsColumns } from "../../serverActions/SmsServerActions";
import Select from "react-select";
import { PlaceholderColumnSelectionType, TableColumn } from "../../sms/type";


export default function ColumnPlaceHolder({ category, isSMS, onSelect }: { category: string | null, isSMS: boolean, onSelect: (value: PlaceholderColumnSelectionType) => any }) {
     const [columns, setColumns] = useState<TableColumn[]>([]);
     const [isClient, setIsClient] = useState(false);
     const [loading, setLoading] = useState<boolean>(false);
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
          const getColumns = async () => {
               if (category && typeof category == "string") {
                    setLoading(true);
                    setError(null);
                    const _category = category.toLowerCase().trim()
                    try {
                         const data = isSMS ? await fetchTableSmsColumns(_category) : await fetchTableColumns(_category);
                         if (Array.isArray(data) && data.length > 0) {
                              setColumns(data);
                         } else {
                              setColumns([])
                         }
                         console.log(data)
                    } catch (err) {
                         setError("Failed to fetch columns");
                    } finally {
                         setLoading(false);
                    }
               }
          };
          setIsClient(true);
          getColumns();
     }, [category]);


     const customStyles = {
          menuPortal: (base: any) => ({
               ...base,
               zIndex: 9999,
          }),
          menu: (base: any) => ({
               ...base,
               maxHeight: '300px',
               overflowY: 'auto',
          }),
     };

     if (loading) {
          return <div>Loading...</div>;
     }

     if (error) {
          return <div>{error}</div>;
     }

     return (
          <div >
               {
                    isClient
                    && category &&
                    <Select
                         options={columns}
                         isDisabled={columns.length == 0}
                         id="selectedColumns"
                         onChange={(option) => { onSelect({ ...option, category } as PlaceholderColumnSelectionType) }}
                         styles={customStyles}
                         name="selectedColumns"
                         placeholder='select placeholder'
                         menuPortalTarget={document.body}
                         getOptionLabel={(e) => e.field}
                         getOptionValue={(e) => e.value}
                    />
               }
          </div>
     );
}
