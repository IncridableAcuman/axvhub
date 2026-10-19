import React, { useState, useMemo } from 'react'
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table'
import { EmptyState } from '../feedback/EmptyState'
import { Skeleton } from '../skeleton/Skeleton'
import { useTranslation } from '@/shared/i18n'

export interface ColumnDef<T> {
  key: string
  header: React.ReactNode
  accessor?: (item: T) => React.ReactNode
  sortable?: boolean
  sortValue?: (item: T) => string | number | boolean
  align?: 'left' | 'center' | 'right'
  className?: string
  width?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  keyExtractor: (item: T, index: number) => string | number
  isLoading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  searchFilter?: (item: T, query: string) => boolean
  searchKeys?: (keyof T)[]
  pageSize?: number
  pageSizeOptions?: number[]
  pagination?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: React.ReactNode
  onRowClick?: (item: T) => void
  toolbarExtra?: React.ReactNode
  className?: string
  tableClassName?: string
  'aria-label'?: string
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  searchable = true,
  searchPlaceholder,
  searchFilter,
  searchKeys,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 25, 50],
  pagination = true,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  onRowClick,
  toolbarExtra,
  className,
  tableClassName,
  'aria-label': ariaLabel,
}: DataTableProps<T>) {
  const { t } = useTranslation()
  const resolvedSearchPlaceholder = searchPlaceholder ?? t('common.search')
  const resolvedEmptyTitle = emptyTitle ?? t('common.noData')
  const resolvedEmptyDescription = emptyDescription ?? t('common.emptyTableDesc')
  const resolvedAriaLabel = ariaLabel ?? t('common.tableAriaLabel')

  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  // Filter
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data

    const query = searchQuery.toLowerCase().trim()

    if (searchFilter) {
      return data.filter((item) => searchFilter(item, query))
    }

    if (searchKeys && searchKeys.length > 0) {
      return data.filter((item) =>
        searchKeys.some((k) => {
          const val = item[k]
          return val !== null && val !== undefined && String(val).toLowerCase().includes(query)
        })
      )
    }

    // Default search: inspect all object string/number values
    return data.filter((item) => {
      return Object.values(item as Record<string, unknown>).some((val) => {
        if (val === null || val === undefined) return false
        if (typeof val === 'object') return false
        return String(val).toLowerCase().includes(query)
      })
    })
  }, [data, searchQuery, searchFilter, searchKeys])

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey || !sortOrder) return filteredData

    const targetCol = columns.find((c) => c.key === sortKey)
    if (!targetCol) return filteredData

    return [...filteredData].sort((a, b) => {
      let valA: unknown
      let valB: unknown

      if (targetCol.sortValue) {
        valA = targetCol.sortValue(a)
        valB = targetCol.sortValue(b)
      } else if (targetCol.key in (a as Record<string, unknown>)) {
        valA = (a as Record<string, unknown>)[targetCol.key]
        valB = (b as Record<string, unknown>)[targetCol.key]
      } else {
        return 0
      }

      if (valA === valB) return 0
      if (valA === null || valA === undefined) return 1
      if (valB === null || valB === undefined) return -1

      const comp =
        typeof valA === 'number' && typeof valB === 'number'
          ? valA - valB
          : String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' })

      return sortOrder === 'asc' ? comp : -comp
    })
  }, [filteredData, sortKey, sortOrder, columns])

  // Pagination
  const totalItems = sortedData.length
  const totalPages = pagination ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1
  const validPage = Math.min(currentPage, totalPages)

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData
    const start = (validPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, validPage, pageSize, pagination])

  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortOrder('asc')
    } else if (sortOrder === 'asc') {
      setSortOrder('desc')
    } else {
      setSortKey(null)
      setSortOrder(null)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const startRecord = totalItems === 0 ? 0 : (validPage - 1) * pageSize + 1
  const endRecord = Math.min(validPage * pageSize, totalItems)

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Toolbar: Search & Extra controls */}
      {(searchable || toolbarExtra) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {searchable ? (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder={resolvedSearchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] transition"
                aria-label={resolvedSearchPlaceholder}
              />
            </div>
          ) : (
            <div />
          )}

          {toolbarExtra && <div className="flex items-center gap-2">{toolbarExtra}</div>}
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl shadow-xs overflow-hidden">
        <Table className={tableClassName} aria-label={resolvedAriaLabel}>
          <TableHeader>
            <TableRow>
              {columns.map((col) => {
                const isSorted = sortKey === col.key
                const isSortable = col.sortable !== false

                return (
                  <TableHead
                    key={col.key}
                    style={{ width: col.width }}
                    className={cn(
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      col.className
                    )}
                    aria-sort={
                      isSorted ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined
                    }
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.key)}
                        className={cn(
                          'inline-flex items-center gap-1.5 group select-none hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] rounded py-0.5 px-1 -ml-1',
                          isSorted && 'text-[var(--brand-primary)] font-bold'
                        )}
                      >
                        <span>{col.header}</span>
                        {isSorted ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-[var(--text-muted)] opacity-40 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              // Loading skeleton rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <TableRow key={`skeleton-row-${rIdx}`}>
                  {columns.map((_, cIdx) => (
                    <TableCell key={`skeleton-cell-${rIdx}-${cIdx}`}>
                      <Skeleton className="h-4 w-full max-w-[140px] rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0 border-0">
                  <div className="py-12">
                    <EmptyState
                      icon={emptyIcon}
                      title={resolvedEmptyTitle}
                      description={resolvedEmptyDescription}
                      className="border-0 bg-transparent"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => {
                const key = keyExtractor(item, index)
                const isClickable = Boolean(onRowClick)

                return (
                  <TableRow
                    key={key}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      isClickable && 'cursor-pointer hover:bg-[var(--bg-subtle)] transition-colors'
                    )}
                  >
                    {columns.map((col) => {
                      let cellContent: React.ReactNode = null
                      if (col.accessor) {
                        cellContent = col.accessor(item)
                      } else if (col.key in (item as Record<string, unknown>)) {
                        cellContent = String((item as Record<string, unknown>)[col.key] ?? '')
                      }

                      return (
                        <TableCell
                          key={`${key}-${col.key}`}
                          className={cn(
                            col.align === 'center' && 'text-center',
                            col.align === 'right' && 'text-right',
                            col.className
                          )}
                        >
                          {cellContent}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {/* Footer & Pagination */}
        {pagination && !isLoading && totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)]/40 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-4">
              <span>
                {t('common.total')}: <strong className="text-[var(--text-primary)]">{totalItems}</strong> — {t('common.showingRecords', { total: totalItems, start: startRecord, end: endRecord })}
              </span>

              {pageSizeOptions && pageSizeOptions.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--text-muted)]">{t('common.perPage')}</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-md px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                  >
                    {pageSizeOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={validPage === 1}
                aria-label={t('common.firstPage')}
                className="p-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handlePageChange(validPage - 1)}
                disabled={validPage === 1}
                aria-label={t('common.prevPage')}
                className="p-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="px-3 py-1 text-xs font-medium text-[var(--text-primary)]">
                {validPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => handlePageChange(validPage + 1)}
                disabled={validPage === totalPages}
                aria-label={t('common.nextPage')}
                className="p-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handlePageChange(totalPages)}
                disabled={validPage === totalPages}
                aria-label={t('common.lastPage')}
                className="p-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
