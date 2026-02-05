"use client";

import { useEffect, useMemo, useState } from "react";
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

import { Pencil, Trash2 } from "lucide-react";

/* ================= TYPES ================= */
type RemarksValue = "Done" | "Pending" | "";
type StatusValue = "Pending" | "Due Date" | "Finish";

type Report = {
  ID: number;
  Items: string;
  Program: string;
  PartName: string;
  ValidationDate: string; // MM/DD/YYYY
  NextValidationDate: string; // MM/DD/YYYY
  Remarks: RemarksValue;
  Person: string;
  Comments?: string;
};

/* ================= DATE HELPERS ================= */
const formatToMMDDYYYY = (d?: Date | null): string => {
  if (!d || isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};

const parseMMDDYYYY = (s?: string): Date | null => {
  if (!s) return null;
  const parts = s.split("/");
  if (parts.length !== 3) return null;
  const d = new Date(Number(parts[2]), Number(parts[0]) - 1, Number(parts[1]));
  if (isNaN(d.getTime())) return null;
  return d;
};

const toInputValue = (mmddyyyy?: string): string => {
  const d = parseMMDDYYYY(mmddyyyy);
  if (!d) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const fromInputToMMDDYYYY = (val?: string): string => {
  if (!val) return "";
  const [y, m, d] = val.split("-");
  return `${m}/${d}/${y}`;
};

const normalizeToMMDDYYYY = (s: any): string => {
  if (!s || typeof s !== "string") return "";
  const maybe = parseMMDDYYYY(s);
  if (maybe) return formatToMMDDYYYY(maybe);
  const d = new Date(s);
  if (!isNaN(d.getTime())) return formatToMMDDYYYY(d);
  return "";
};

/* ================= STATUS HELPERS (DYNAMIC) ================= */
/** Days until given date relative to `now` */
const daysUntil = (mmddyyyy: string | undefined, now: Date): number => {
  const d = parseMMDDYYYY(mmddyyyy);
  if (!d) return Number.POSITIVE_INFINITY;
  const startNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startDue = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.ceil((startDue - startNow) / (1000 * 60 * 60 * 24));
};

/** Derive current status based on Remarks + NextValidationDate against `now` */
const deriveStatus = (r: Report, now: Date): StatusValue => {
  if (r.Remarks === "Done") return "Finish";
  const left = daysUntil(r.NextValidationDate, now);
  if (left < 5) return "Due Date";
  return "Pending";
};

/* ================= COMMENT CELL ================= */
function CommentCell({ value }: { value?: string }) {
  const [expanded, setExpanded] = useState(false);
  const text = value ?? "";
  const long = text.length > 255;

  return (
    <div className="whitespace-normal break-words max-w-[40ch] md:max-w-[60ch]">
      {expanded ? text : text.slice(0, 255)}
      {!expanded && long ? "…" : ""}
      {long && (
        <button
          className="ml-1 text-xs text-blue-600 hover:underline"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

/* ================= MAIN COMPONENT ================= */
export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | StatusValue>("all");

  /* Person search (free text) */
  const [personQuery, setPersonQuery] = useState<string>("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [validationDate, setValidationDate] = useState("");
  const [nextValidationDate, setNextValidationDate] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  /* NEW: dynamic 'now' that updates periodically so status auto-refreshes */
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    // Tick every 60 seconds (tune as needed). Keeps statuses current.
    const id = setInterval(() => setNow(new Date()), 3);

    // OPTIONAL: also re-tick when tab becomes visible (if user returns after hours)
    const onVisible = () => setNow(new Date());
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);


  /* ================= FETCH REPORTS ================= */
  const fetchReports = async () => {
    try {
      const res = await fetch("/api/fetch-reports/", { cache: "no-store" });
      const data = await res.json();

      const normalized: Report[] = (data.records || []).map((r: any) => ({
        ID: Number(r.ID),
        Items: r.Items ?? "",
        Program: r.Program ?? "",
        PartName: r.PartName ?? "",
        ValidationDate: normalizeToMMDDYYYY(r.ValidationDate),
        NextValidationDate: normalizeToMMDDYYYY(r.NextValidationDate),
        Remarks: ["Done", "Pending"].includes(r.Remarks) ? r.Remarks : "",
        Comments: r.Comments ?? "",
        Person: r.Person ?? "",
      }));

      setReports(normalized);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  /* ================= EDIT ================= */
  const handleEditImmediate = async (r: Report) => {
  setLoading(true);

  try {
    const payload = {
      ID: r.ID,
      Items: r.Items,
      Program: r.Program,
      PartName: r.PartName,
      ValidationDate: r.ValidationDate || null,
      NextValidationDate: r.NextValidationDate || null,
      Remarks: r.Remarks,
      Comments: r.Comments?.slice(0, 255) || "",
      Person: r.Person,
    };

    const res = await fetch("/api/update-record", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    await fetchReports(); // refresh table
  } catch (err) {
    alert("Update error: " + (err as any).message);
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  /* ================= SAVE ================= */
  const handleSave = async (e: any) => {
    e.preventDefault();
    if (!selectedReport) return;

    setLoading(true);
    try {
      const payload = {
        ID: selectedReport.ID > 0 ? selectedReport.ID : undefined,
        Items: selectedReport.Items,
        Program: selectedReport.Program,
        PartName: selectedReport.PartName,
        ValidationDate: validationDate,
        NextValidationDate: nextValidationDate,
        Remarks: selectedReport.Remarks,
        Comments: comments.slice(0, 255),
        Person: selectedReport.Person,
      };

      const res = await fetch("/api/add-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await fetchReports();
      setIsEditOpen(false);
    } catch (err) {
      alert("Save error: " + (err as any).message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  /* ================= FILTER (YEAR + STATUS + PERSON QUERY) ================= */
  const filtered = useMemo(() => {
    let data =
      yearFilter === "all"
        ? reports
        : reports.filter(
            (r) =>
              parseMMDDYYYY(r.ValidationDate)?.getFullYear().toString() ===
              yearFilter,
          );

    if (statusFilter !== "all") {
      data = data.filter((r) => deriveStatus(r, now) === statusFilter);
    }

    if (personQuery.trim() !== "") {
      const needle = personQuery.trim().toLowerCase();
      data = data.filter((r) => (r.Person ?? "").toLowerCase().includes(needle));
    }

    return data;
  }, [reports, yearFilter, statusFilter, personQuery, now]); // <- include `now` so it refilters dynamically

  /* ================= TABLE COLUMNS ================= */
  const columns: ColumnDef<Report>[] = [
    { accessorKey: "Items", header: "Items" },
    { accessorKey: "Program", header: "Program" },
    { accessorKey: "PartName", header: "Part Name" },
    { accessorKey: "ValidationDate", header: "Validation Date" },
    { accessorKey: "NextValidationDate", header: "Next Validation Date" },
  
    {
      id: "status",
      header: "Remarks Status",
      cell: ({ row }) => {
        const status = deriveStatus(row.original, now); // <- use `now` here dynamically
        const color =
          status === "Finish"
            ? "bg-green-100 text-green-700"
            : status === "Due Date"
            ? "bg-red-100 text-red-700"
            : "bg-yellow-100 text-yellow-700";

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold block text-center whitespace-normal break-words max-w-[150px] ${color}`}
          >
            {status === "Due Date"
              ? "Need to validate before due date"
              : status}
          </span>
        );
      },
    },

    { accessorKey: "Remarks", header: "Remarks" },
    { 
      accessorKey: "Person", 
      header: "Person",
      cell: ({ row }) => row.original.Person || "-" // fallback if null/empty
    },
    {
      accessorKey: "Comments",
      header: "Comments",
      cell: ({ row }) => <CommentCell value={row.original.Comments} />,
    },

    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex gap-1 justify-center">
      <Button
  size="icon"
  variant="ghost"
  onClick={() => {
    setSelectedReport(row.original);
    setValidationDate(row.original.ValidationDate);
    setNextValidationDate(row.original.NextValidationDate);
    setComments(row.original.Comments || "");
    setIsEditOpen(true);
  }}
>
  <Pencil className="h-4 w-4 text-blue-600" />
</Button>


          <Button size="icon" variant="ghost">
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filtered,
    columns,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  /* ================= RENDER ================= */
  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Inventory</h1>

        <div className="flex gap-4 flex-wrap items-center">
          {/* YEAR FILTER */}
          <Select
            value={yearFilter}
            onValueChange={(v) => {
              setYearFilter(v);
              setPageIndex(0);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter year" />
            </SelectTrigger>

            <SelectContent className="bg-white">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>

          {/* STATUS FILTER */}
          <Select
            value={statusFilter}
            onValueChange={(v: "all" | StatusValue) => {
              setStatusFilter(v);
              setPageIndex(0);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>

            <SelectContent className="bg-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Due Date">Due Date</SelectItem>
              <SelectItem value="Finish">Finish</SelectItem>
            </SelectContent>
          </Select>

          {/* PERSON SEARCH */}
          <div className="w-[200px]">
            <Input
              value={personQuery}
              onChange={(e) => {
                setPersonQuery(e.target.value);
                setPageIndex(0);
              }}
              placeholder="Search person…"
            />
          </div>

          {/* ROW SELECTOR */}
          <Select
            value={pageSize === filtered.length ? "all" : pageSize.toString()}
            onValueChange={(val) => {
              setPageIndex(0);
              if (val === "all") setPageSize(filtered.length || 1);
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
          <Sheet
            open={isEditOpen}
            onOpenChange={(o) => {
              if (!o) setSelectedReport(null);
              setIsEditOpen(o);
            }}
          >
            <SheetTrigger asChild>
              <Button
                onClick={() => {
                  setSelectedReport({
                    ID: 0,
                    Items: "",
                    Program: "",
                    PartName: "",
                    ValidationDate: "",
                    NextValidationDate: "",
                    Remarks: "Done",
                    Comments: "",
                    Person: "",
                  });

                  setValidationDate("");
                  setNextValidationDate("");
                  setComments("");

                  setIsEditOpen(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Add New
              </Button>
            </SheetTrigger>

            <SheetContent className="bg-white">
              <SheetHeader>
                <SheetTitle>
                  {selectedReport?.ID ? "Edit" : "Add"} Report
                </SheetTitle>
                <SheetDescription>Fill in all fields</SheetDescription>
              </SheetHeader>

              {/* FORM */}
              <form className="mt-4 space-y-4" onSubmit={handleSave}>
                <div>
                  <Label>Items</Label>
                  <Input
                    value={selectedReport?.Items || ""}
                    onChange={(e) =>
                      setSelectedReport((p) =>
                        p ? { ...p, Items: e.target.value } : p,
                      )
                    }
                  />
                </div>

                <div>
                  <Label>Program</Label>
                  <Input
                    value={selectedReport?.Program || ""}
                    onChange={(e) =>
                      setSelectedReport((p) =>
                        p ? { ...p, Program: e.target.value } : p,
                      )
                    }
                  />
                </div>

                <div>
                  <Label>Part Name</Label>
                  <Input
                    value={selectedReport?.PartName || ""}
                    onChange={(e) =>
                      setSelectedReport((p) =>
                        p ? { ...p, PartName: e.target.value } : p,
                      )
                    }
                  />
                </div>

                <div>
                  <Label>Validation Date</Label>
                  <input
                    type="date"
                    value={toInputValue(validationDate)}
                    onChange={(e) =>
                      setValidationDate(fromInputToMMDDYYYY(e.target.value))
                    }
                    className="w-full border rounded p-2"
                  />
                </div>

                <div>
                  <Label>Next Validation Date</Label>
                  <input
                    type="date"
                    value={toInputValue(nextValidationDate)}
                    onChange={(e) =>
                      setNextValidationDate(
                        fromInputToMMDDYYYY(e.target.value),
                      )
                    }
                    className="w-full border rounded p-2"
                  />
                </div>

                {/* REMARKS */}
                <div>
                  <Label>Remarks</Label>
                  <Select
                    value={selectedReport?.Remarks}
                    onValueChange={(v: RemarksValue) =>
                      setSelectedReport((p) =>
                        p ? { ...p, Remarks: v } : p,
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select remarks" />
                    </SelectTrigger>

                    <SelectContent className="bg-white">
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* PERSON */}
                <div>
                  <Label>Person</Label>
                  <Input
                    value={selectedReport?.Person || ""}
                    onChange={(e) =>
                      setSelectedReport((p) =>
                        p ? { ...p, Person: e.target.value } : p,
                      )
                    }
                  />
                </div>

                {/* COMMENTS */}
                <div>
                  <Label>Comments</Label>
                  <textarea
                    maxLength={255}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full border rounded p-2 h-16"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black hover:bg-[#2C2C2C] text-white"
                >
                  {loading ? "Saving..." : "Save"}
                </Button>

                <Button
                  type="button"
                  className="w-full bg-white-200 hover:bg-white"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto">
        <Table className="w-full table-fixed border rounded-lg">
          <TableHeader>
            {table.getHeaderGroups().map((g) => (
              <TableRow key={g.id}>
                {g.headers.map((h) => (
                  <TableHead key={h.id} className="bg-[#222] text-white">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-4">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const colKey = (cell.column.columnDef as any).accessorKey;
                    const isComments = colKey === "Comments";
                    const isStatus = cell.column.columnDef.id === "status";

                    return (
                      <TableCell
                        key={cell.id}
                        className={
                          isComments || isStatus
                            ? "whitespace-normal break-words align-top"
                            : "whitespace-nowrap"
                        }
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="mt-4 ">
        <Pagination className="flex justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => table.previousPage()} />
            </PaginationItem>

            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink onClick={() => table.setPageIndex(i)}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext onClick={() => table.nextPage()} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}