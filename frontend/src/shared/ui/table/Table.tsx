import React, { forwardRef } from 'react'
import { cn } from '@/shared/lib/utils'

export const Table = forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-x-auto rounded-lg border border-[var(--border-default)]">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-xs sm:text-sm text-left border-collapse', className)}
        {...props}
      />
    </div>
  )
)
Table.displayName = 'Table'

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-b border-[var(--border-default)] font-semibold', className)}
    {...props}
  />
))
TableHeader.displayName = 'TableHeader'

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('divide-y divide-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)]', className)}
    {...props}
  />
))
TableBody.displayName = 'TableBody'

export const TableRow = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'transition-colors hover:bg-[var(--bg-subtle)]/70 data-[state=selected]:bg-[var(--brand-subtle)]',
        className
      )}
      {...props}
    />
  )
)
TableRow.displayName = 'TableRow'

export const TableHead = forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn('h-10 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]', className)}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

export const TableCell = forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-3 sm:p-4 align-middle text-[var(--text-primary)]', className)}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-3 text-xs text-[var(--text-muted)] italic', className)}
    {...props}
  />
))
TableCaption.displayName = 'TableCaption'
