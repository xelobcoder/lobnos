"use client"
import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, ChevronDown, Filter } from "lucide-react"
import TableLoading from './TableLoading'

interface PrimeTableProps {
  column: any[];
  data: any[];
  filtering?: boolean;
  serverSideFiltering?: boolean;
  handleSeverSideProcessing?: (params: { page: number; count: number }) => Promise<any>;
  urlparams?: Record<string, any>;
}

export default function PrimeTable({
  column,
  data,
  filtering,
  serverSideFiltering = false,
  handleSeverSideProcessing,
  urlparams = {}
}: PrimeTableProps) {
  const [filteredData, setFilteredData] = useState(data)
  const [isLoading, setIsLoading] = useState(false)
  const [queryParams, setQueryParams] = useState({ count: 10, page: 1 })
  const [sorting, setSorting] = useState<{ id: string; desc: boolean } | null>(null)

  useEffect(() => {
    setFilteredData(data)
  }, [data])

  const handleSort = (columnId: string) => {
    setSorting(prev => {
      if (prev?.id === columnId) {
        return { id: columnId, desc: !prev.desc }
      }
      return { id: columnId, desc: false }
    })

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[columnId]
      const bValue = b[columnId]
      return sorting?.desc ? 
        (aValue > bValue ? -1 : 1) : 
        (aValue > bValue ? 1 : -1)
    })
    setFilteredData(sorted)
  }

  const handleFilter = (value: string, column: any) => {
    if (!value) {
      setFilteredData(data)
      return
    }

    const filtered = data.filter(row => {
      const cellValue = row[column.accessor]?.toString().toLowerCase()
      return cellValue?.includes(value.toLowerCase())
    })
    setFilteredData(filtered)
  }

  const handlePagination = async (page: number) => {
    if (handleSeverSideProcessing) {
      setIsLoading(true)
      try {
        const result = await handleSeverSideProcessing({ 
          page, 
          count: queryParams.count 
        })
        setFilteredData(result.data || [])
        setQueryParams(prev => ({ ...prev, page }))
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (isLoading) return <TableLoading span={column.length} />

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {filtering && (
          <Input 
            placeholder="Filter all columns..."
            className="max-w-sm"
            onChange={(e) => handleFilter(e.target.value, column[0])}
          />
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {column.map((col, i) => (
                <TableHead key={i}>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(col.accessor)}
                    >
                      {col.Header}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                    {col.filteringMode && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <Filter className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <div className="p-2">
                            <Input
                              placeholder={`Filter ${col.Header}...`}
                              onChange={(e) => handleFilter(e.target.value, col)}
                            />
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {column.map((col, colIndex) => (
                  <TableCell key={colIndex}>
                    {col.Cell ? col.Cell({ value: row[col.accessor], row: { original: row } }) 
                      : row[col.accessor]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {serverSideFiltering && (
        <div className="flex items-center justify-end space-x-2">
          {[1, 2, 3, 4, 5].map((page) => (
            <Button
              key={page}
              variant={queryParams.page === page ? "default" : "outline"}
              onClick={() => handlePagination(page)}
            >
              {page}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}


