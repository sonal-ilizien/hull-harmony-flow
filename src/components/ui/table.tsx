import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// ---------------- Table Components ----------------
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto rounded-xl shadow-md">
    <table
      ref={ref}
      className={cn(
        "w-full text-sm border border-gray-300 bg-blue-50 rounded-xl",
        "border-collapse",
        className
      )}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("bg-[#1a2746] text-white", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-gray-300", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors hover:bg-blue-200",
      "odd:bg-blue-50 even:bg-blue-100", // striped light blue
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-sm tracking-wide",
      "bg-[#1a2746] text-white border border-gray-300",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-4 py-3 text-gray-800 text-sm whitespace-nowrap",
      "border border-gray-300 bg-blue-50", // subtle blue cell background
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

// ---------------- Pagination ----------------
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const TablePagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => (
  <div className="flex items-center justify-between py-3 px-4 border-t border-gray-300 bg-blue-50 rounded-b-xl">
    <Button
      variant="outline"
      size="sm"
      disabled={currentPage === 1}
      onClick={() => onPageChange(currentPage - 1)}
    >
      Previous
    </Button>

    <span className="text-sm font-medium">
      Page <b>{currentPage}</b> of {totalPages}
    </span>

    <Button
      variant="outline"
      size="sm"
      disabled={currentPage === totalPages}
      onClick={() => onPageChange(currentPage + 1)}
    >
      Next
    </Button>
  </div>
);

// ---------------- Reusable DataTable ----------------
export interface Column<T> {
  header: string;
  accessor: keyof T | "actions";
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowsPerPage?: number;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  rowsPerPage = 10,
  onEdit,
  onDelete,
  className,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [rowToDelete, setRowToDelete] = React.useState<T | null>(null);

  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));

  const paginatedData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleDeleteClick = (row: T) => {
    setRowToDelete(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (rowToDelete && onDelete) {
      onDelete(rowToDelete);
    }
    setDeleteDialogOpen(false);
    setRowToDelete(null);
  };

  // ---------------- Import Handler ----------------
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.xlsx,.xls";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        alert(`Imported file: ${file.name}`); // replace with actual logic
      }
    };
    input.click();
  };

  // ---------------- Export Handler ----------------
  const handleExport = () => {
    const headers = columns.map((col) => col.header).join(",");
    const rows = data.map((row) =>
      columns
        .map((col) =>
          col.accessor !== "actions" ? JSON.stringify(row[col.accessor]) : ""
        )
        .join(",")
    );
    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* <Table className={className}> */}
      {/* Toolbar with Import / Export */}
      <div className="flex justify-end gap-2">
        <Button
          className="bg-[#1a2746] text-white hover:bg-[#223366] rounded-lg shadow-sm"
          onClick={handleImport}
        >
          Import
        </Button>
        <Button
          className="bg-green-600 text-white hover:bg-green-700 rounded-lg shadow-sm"
          onClick={handleExport}
        >
          Export
        </Button>
      </div>

      <Table className={className}>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.header}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((row, i) => (
            <TableRow key={i}>
              {columns.map((col) => (
                <TableCell key={col.header}>
                  {col.accessor === "actions" ? (
                    col.render ? (
                      col.render(row)
                    ) : (
                      <div className="flex gap-2">
                        {onEdit && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-[#1a2746] text-white hover:bg-[#223366] border border-gray-400 rounded-md"
                            onClick={() => onEdit(row)}
                          >
                            Edit
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-red-600 text-white hover:bg-red-700 border border-gray-400 rounded-md"
                            onClick={() => handleDeleteClick(row)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    )
                  ) : col.render ? (
                    col.render(row)
                  ) : (
                    row[col.accessor]
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="text-gray-700">
            Are you sure you want to delete this record?
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
