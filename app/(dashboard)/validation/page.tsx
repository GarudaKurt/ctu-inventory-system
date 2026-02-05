"use client";

import { useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { CalendarIcon, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

/* ================= TYPES ================= */
type Report = {
  itemId: number;
  itemNumber: string;
  program: string;
  partName: string;
  validationDate: string;
  nextValidationDate: string;
  remarks: string;
  comments?: string; // new column
};

/* ================= HELPERS ================= */
const getDaysRemaining = (nextDate: string) => {
  const today = new Date();
  const next = new Date(nextDate);
  return Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

/* ================= MOCK DATA ================= */
const data: Report[] = Array.from({ length: 20 }, (_, i) => {
  const today = new Date();
  const validationDate = new Date(today);
  validationDate.setMonth(today.getMonth() - 6);

  const nextValidationDate = new Date(today);
  nextValidationDate.setDate(today.getDate() + (i - 5) * 3);

  return {
    itemId: i + 1,
    itemNumber: `PN-${1000 + i}`,
    program: i % 2 === 0 ? "Engine" : "Hydraulics",
    partName: `Part ${i + 1}`,
    validationDate: validationDate.toISOString().split("T")[0],
    nextValidationDate: nextValidationDate.toISOString().split("T")[0],
    remarks: "",
    comments: "",
  };
});

export default function ValidationsItems() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [yearFilter, setYearFilter] = useState("all");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [validationDate, setValidationDate] = useState<Date>();
  const [nextValidationDate, setNextValidationDate] = useState<Date>();
  const [comments, setComments] = useState<string>("");

  const handleEdit = (report: Report) => {
    setSelectedReport(report);
    setValidationDate(new Date(report.validationDate));
    setNextValidationDate(new Date(report.nextValidationDate));
    setComments(report.comments ?? "");
    setIsEditOpen(true);
  };

  const filteredData = useMemo(() => {
    const base =
      yearFilter === "all"
        ? data
        : data.filter(
            (item) =>
              new Date(item.validationDate).getFullYear().toString() ===
              yearFilter,
          );
    return [...base].sort(
      (a, b) =>
        getDaysRemaining(a.nextValidationDate) -
        getDaysRemaining(b.nextValidationDate),
    );
  }, [yearFilter]);

  const columns: ColumnDef<Report>[] = [
    { accessorKey: "itemId", header: "ID" },
    { accessorKey: "itemNumber", header: "Item Number / Parts Number" },
    { accessorKey: "program", header: "Program" },
    { accessorKey: "partName", header: "Part Name" },
    { accessorKey: "validationDate", header: "Validation Date" },
    { accessorKey: "nextValidationDate", header: "Next Validation Date" },
    {
      id: "remarks",
      header: "Remarks",
      cell: ({ row }) => {
        const daysLeft = getDaysRemaining(row.original.nextValidationDate);
        const isDueSoon = daysLeft <= 5;
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
              isDueSoon
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {isDueSoon ? "Need to validate before due date" : "Validated"}
          </span>
        );
      },
    },
    { accessorKey: "comments", header: "Comments" },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      size: 80,
      cell: ({ row }) => (
        <div className="flex justify-center gap-1 whitespace-nowrap">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleEdit(row.original)}
          >
            <Pencil className="h-4 w-4 text-blue-600" />
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex w-full justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Validations</h1>

        <div className="flex items-center gap-4">
          {/* YEAR FILTER */}
          <Select
            value={yearFilter}
            onValueChange={(val) => {
              setYearFilter(val);
              setPageIndex(0);
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
              pageSize === filteredData.length ? "all" : pageSize.toString()
            }
            onValueChange={(val) => {
              setPageIndex(0);
              if (val === "all") setPageSize(filteredData.length || 1);
              else setPageSize(Number(val));
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

          {/* ADD / EDIT SHEET */}
          <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
            <SheetTrigger asChild>
              <Button
                className="bg-green-500 text-white hover:bg-green-700"
                onClick={() => {
                  setSelectedReport(null);
                  setValidationDate(undefined);
                  setNextValidationDate(undefined);
                  setComments("");
                  setIsEditOpen(true);
                }}
              >
                Add New Report
              </Button>
            </SheetTrigger>

            <SheetContent className="bg-white">
              <SheetHeader>
                <SheetTitle>
                  {selectedReport ? "Edit Report" : "Add New Report"}
                </SheetTitle>
                <SheetDescription>Fill in the details below.</SheetDescription>
              </SheetHeader>

              <form className="space-y-4 mt-4">
                <div>
                  <Label>Item Number / Parts Number</Label>
                  <Input defaultValue={selectedReport?.itemNumber ?? ""} />
                </div>
                <div>
                  <Label>Program</Label>
                  <Input defaultValue={selectedReport?.program ?? ""} />
                </div>
                <div>
                  <Label>Part Name</Label>
                  <Input defaultValue={selectedReport?.partName ?? ""} />
                </div>

                <div>
                  <Label>Validation Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
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

                <div>
                  <Label>Next Validation Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
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
                  <Input defaultValue={selectedReport?.remarks ?? ""} />
                </div>

                <div>
                  <Label>Comments</Label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Optional comments"
                    className="w-full max-w-full h-24 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Button className="w-full bg-[#2C2C2C] hover:bg-black text-white">
                  Save Report
                </Button>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
<Table className="w-full table-fixed border rounded-lg">
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="bg-[#2C2C2C] text-white whitespace-nowrap"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row, i) => (
              <TableRow key={row.id} className={i % 2 ? "bg-gray-100" : ""}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="mt-4">
        <Pagination className="flex justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={(e) => {
                  e.preventDefault();
                  table.previousPage();
                }}
              />
            </PaginationItem>

            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={i === pageIndex}
                  onClick={(e) => {
                    e.preventDefault();
                    table.setPageIndex(i);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={(e) => {
                  e.preventDefault();
                  table.nextPage();
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
