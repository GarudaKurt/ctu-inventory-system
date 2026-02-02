"use client"

import {useMemo, useState} from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

/* ================= TYPES ================= */
type Report = {
  itemId: number
  itemNumber: string
  program: string
  partName: string
  validationDate: string
  nextValidationDate: string
  remarks: string
}

/* ================= COLUMNS ================= */
const columns: ColumnDef<Report>[] = [
  { accessorKey: "itemId", header: "ID" },
  { accessorKey: "itemNumber", header: "Item Number / Parts Number" },
  { accessorKey: "program", header: "Program" },
  { accessorKey: "partName", header: "Part Name" },
  { accessorKey: "validationDate", header: "Validation Date" },
  { accessorKey: "nextValidationDate", header: "Next Validation Date" },
  { accessorKey: "remarks", header: "Remarks" },
]

/* ================= DATA ================= */
const data: Report[] = [
  {
    itemId: 1,
    itemNumber: "123-ABC",
    program: "Engine",
    partName: "Fuel Pump",
    validationDate: "2025-01-15",
    nextValidationDate: "2026-01-15",
    remarks: "Validated",
  },
]

export default function Reports() {
  /* ================= STATE ================= */
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [yearFilter, setYearFilter] = useState("all")

  const [validationDate, setValidationDate] = useState<Date>()
  const [nextValidationDate, setNextValidationDate] = useState<Date>()

  /* ================= FILTERED DATA ================= */
  const filteredData = useMemo(() => {
    if (yearFilter === "all") return data

    return data.filter(item => {
      const year = new Date(item.validationDate).getFullYear().toString()
      return year === yearFilter
    })
  }, [yearFilter])

  /* ================= TABLE ================= */
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: updater => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater

      setPageIndex(next.pageIndex)
      setPageSize(next.pageSize)
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Reports</h1>

        <div className="flex items-center gap-4">
          {/* YEAR FILTER */}
          <Select
            value={yearFilter}
            onValueChange={val => {
              setYearFilter(val)
              setPageIndex(0)
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter Year" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>

          {/* ROWS PER PAGE */}
          <Select
            value={
              pageSize === filteredData.length
                ? "all"
                : pageSize.toString()
            }
            onValueChange={val => {
              setPageIndex(0)
              if (val === "all") {
                setPageSize(filteredData.length || 1)
              } else {
                setPageSize(Number(val))
              }
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Rows per page" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>

          {/* ADD BUTTON */}
          <Sheet>
            <SheetTrigger asChild>
              <Button className="bg-green-500 text-white hover:bg-green-700">
                Add New Report
              </Button>
            </SheetTrigger>

            <SheetContent className="bg-white">
              <SheetHeader>
                <SheetTitle>Add New Report</SheetTitle>
                <SheetDescription>
                  Fill in the details below to add a new report.
                </SheetDescription>
              </SheetHeader>

              <form className="space-y-4 mt-4">
                <div>
                  <Label>Item Number / Parts Number</Label>
                  <Input />
                </div>

                <div>
                  <Label>Program</Label>
                  <Input />
                </div>

                <div>
                  <Label>Part Name</Label>
                  <Input />
                </div>

                {/* Validation Date */}
                <div>
                  <Label>Validation Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {validationDate
                          ? format(validationDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Calendar
                        mode="single"
                        selected={validationDate}
                        onSelect={setValidationDate}
                        className="bg-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Next Validation Date */}
                <div>
                  <Label>Next Validation Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {nextValidationDate
                          ? format(nextValidationDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Calendar
                        mode="single"
                        selected={nextValidationDate}
                        onSelect={setNextValidationDate}
                        className="bg-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Remarks</Label>
                  <Input />
                </div>

                <Button className="w-full bg-[#2C2C2C] hover:bg-black text-white">
                  Save Report
                </Button>
                <Button className="w-full bg-white text-black">
                  Cancel
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* TABLE */}
      <Table className="border rounded-lg">
        <TableHeader>
          {table.getHeaderGroups().map(group => (
            <TableRow key={group.id}>
              {group.headers.map(header => (
                <TableHead key={header.id} className="bg-[#2C2C2C] text-white">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row, i) => (
            <TableRow key={row.id} className={i % 2 ? "bg-gray-100" : ""}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* PAGINATION */}
      <div className="mt-4">
        <Pagination className="flex justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={e => {
                  e.preventDefault()
                  table.previousPage()
                }}
                className={!table.getCanPreviousPage() ? "opacity-50 pointer-events-none" : ""}
              />
            </PaginationItem>

            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={i === pageIndex}
                  onClick={e => {
                    e.preventDefault()
                    table.setPageIndex(i)
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={e => {
                  e.preventDefault()
                  table.nextPage()
                }}
                className={!table.getCanNextPage() ? "opacity-50 pointer-events-none" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
