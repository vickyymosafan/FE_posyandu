// Table component with sorting and pagination
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Loading } from "./loading";

// Base table components
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("bg-gray-900/5 font-medium [&>tr]:last:border-b-0", className)}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-50",
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
      "h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0",
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
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-gray-500", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

// Enhanced DataTable with sorting and pagination
export interface Column<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  // Sorting
  sortable?: boolean;
  defaultSortKey?: keyof T | string;
  defaultSortOrder?: "asc" | "desc";
  onSort?: (key: keyof T | string, order: "asc" | "desc") => void;
  // Pagination
  pagination?: boolean;
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  // Selection
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selectedRows: T[]) => void;
  rowKey?: keyof T | ((row: T) => string | number);
}

function DataTable<T>({
  data,
  columns,
  loading = false,
  emptyMessage = "Tidak ada data",
  className,
  // Sorting
  sortable = true,
  defaultSortKey,
  defaultSortOrder = "asc",
  onSort,
  // Pagination
  pagination = false,
  pageSize = 10,
  currentPage = 1,
  totalItems,
  onPageChange,
  // Selection
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  rowKey = "id" as keyof T,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<keyof T | string | null>(defaultSortKey || null);
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">(defaultSortOrder);
  const [internalSelectedRows, setInternalSelectedRows] = React.useState<T[]>(selectedRows);

  // Handle sorting
  const handleSort = (key: keyof T | string) => {
    if (!sortable) return;

    let newOrder: "asc" | "desc" = "asc";
    if (sortKey === key && sortOrder === "asc") {
      newOrder = "desc";
    }

    setSortKey(key);
    setSortOrder(newOrder);
    onSort?.(key, newOrder);
  };

  // Handle row selection
  const getRowKey = (row: T): string | number => {
    if (typeof rowKey === "function") {
      return rowKey(row);
    }
    return row[rowKey] as string | number;
  };

  const handleRowSelect = (row: T, checked: boolean) => {
    const rowId = getRowKey(row);
    let newSelection: T[];

    if (checked) {
      newSelection = [...internalSelectedRows, row];
    } else {
      newSelection = internalSelectedRows.filter(r => getRowKey(r) !== rowId);
    }

    setInternalSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? [...data] : [];
    setInternalSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  const isRowSelected = (row: T) => {
    const rowId = getRowKey(row);
    return internalSelectedRows.some(r => getRowKey(r) === rowId);
  };

  const isAllSelected = data.length > 0 && internalSelectedRows.length === data.length;
  const isIndeterminate = internalSelectedRows.length > 0 && internalSelectedRows.length < data.length;

  // Render sort icon
  const renderSortIcon = (columnKey: keyof T | string) => {
    if (!sortable) return null;

    return (
      <span className="ml-1 inline-flex flex-col">
        <svg
          className={cn(
            "w-3 h-3 -mb-1",
            sortKey === columnKey && sortOrder === "asc" ? "text-blue-600" : "text-gray-400"
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" />
        </svg>
        <svg
          className={cn(
            "w-3 h-3",
            sortKey === columnKey && sortOrder === "desc" ? "text-blue-600" : "text-gray-400"
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </span>
    );
  };

  // Calculate pagination
  const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : Math.ceil(data.length / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || data.length);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={cn(
                    column.sortable !== false && sortable && "cursor-pointer hover:bg-gray-50",
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right"
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.title}
                    {column.sortable !== false && renderSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-8">
                  <Loading size="md" />
                  <p className="mt-2 text-gray-500">Memuat data...</p>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-8">
                  <p className="text-gray-500">{emptyMessage}</p>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={getRowKey(row)}>
                  {selectable && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={isRowSelected(row)}
                        onChange={(e) => handleRowSelect(row, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.key)}
                      className={cn(
                        column.align === "center" && "text-center",
                        column.align === "right" && "text-right"
                      )}
                    >
                      {column.render
                        ? column.render(
                            typeof column.key === "string" && column.key.includes(".")
                              ? column.key.split(".").reduce((obj: any, key: string) => obj?.[key], row)
                              : row[column.key as keyof T],
                            row,
                            index
                          )
                        : String(
                            typeof column.key === "string" && column.key.includes(".")
                              ? column.key.split(".").reduce((obj: any, key: string) => obj?.[key], row)
                              : row[column.key as keyof T] || ""
                          )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && !loading && data.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Menampilkan {startItem} sampai {endItem} dari {totalItems || data.length} data
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Sebelumnya
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange?.(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableCell,
  TableRow,
  TableCaption,
  DataTable,
};