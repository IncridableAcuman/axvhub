import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DataTable, ColumnDef } from '../DataTable'

interface TestUser {
  id: number
  name: string
  role: string
  score: number
}

const mockUsers: TestUser[] = [
  { id: 1, name: 'Ali Valiyev', role: 'Mentor', score: 95 },
  { id: 2, name: 'Zarina Rahimova', role: 'Student', score: 88 },
  { id: 3, name: 'Bobur Mirzayev', role: 'Student', score: 72 },
  { id: 4, name: 'Dilnoza Karimova', role: 'Admin', score: 99 },
]

const columns: ColumnDef<TestUser>[] = [
  { key: 'name', header: 'F.I.O', sortable: true },
  { key: 'role', header: 'Rol', sortable: true },
  { key: 'score', header: 'Ball', sortable: true, align: 'right' },
]

describe('DataTable Component', () => {
  it('renders table headers and rows correctly', () => {
    render(
      <DataTable
        data={mockUsers}
        columns={columns}
        keyExtractor={(u) => u.id}
      />
    )

    expect(screen.getByText('F.I.O')).toBeInTheDocument()
    expect(screen.getByText('Rol')).toBeInTheDocument()
    expect(screen.getByText('Ball')).toBeInTheDocument()

    expect(screen.getByText('Ali Valiyev')).toBeInTheDocument()
    expect(screen.getByText('Zarina Rahimova')).toBeInTheDocument()
    expect(screen.getByText('Bobur Mirzayev')).toBeInTheDocument()
  })

  it('filters data based on search input', () => {
    render(
      <DataTable
        data={mockUsers}
        columns={columns}
        keyExtractor={(u) => u.id}
        searchPlaceholder="Ism bo'yicha qidiruv"
      />
    )

    const searchInput = screen.getByPlaceholderText("Ism bo'yicha qidiruv")
    fireEvent.change(searchInput, { target: { value: 'Zarina' } })

    expect(screen.getByText('Zarina Rahimova')).toBeInTheDocument()
    expect(screen.queryByText('Ali Valiyev')).not.toBeInTheDocument()
    expect(screen.queryByText('Bobur Mirzayev')).not.toBeInTheDocument()
  })

  it('displays empty state when search finds no matches', () => {
    render(
      <DataTable
        data={mockUsers}
        columns={columns}
        keyExtractor={(u) => u.id}
        emptyTitle="Hech narsa topilmadi"
      />
    )

    const searchInput = screen.getByPlaceholderText('Qidirish...')
    fireEvent.change(searchInput, { target: { value: 'NonexistentUser123' } })

    expect(screen.getByText('Hech narsa topilmadi')).toBeInTheDocument()
  })

  it('sorts columns when header sort button is clicked', () => {
    render(
      <DataTable
        data={mockUsers}
        columns={columns}
        keyExtractor={(u) => u.id}
      />
    )

    const nameHeader = screen.getByText('F.I.O')
    // Click once for asc
    fireEvent.click(nameHeader)
    const rowsAsc = screen.getAllByRole('row')
    // Header is row 0, first data row should be Ali
    expect(rowsAsc[1]).toHaveTextContent('Ali Valiyev')

    // Click again for desc
    fireEvent.click(nameHeader)
    const rowsDesc = screen.getAllByRole('row')
    // First data row should now be Zarina
    expect(rowsDesc[1]).toHaveTextContent('Zarina Rahimova')
  })

  it('calls onRowClick when a row is clicked', () => {
    const handleRowClick = vi.fn()
    render(
      <DataTable
        data={mockUsers}
        columns={columns}
        keyExtractor={(u) => u.id}
        onRowClick={handleRowClick}
      />
    )

    const row = screen.getByText('Ali Valiyev')
    fireEvent.click(row)
    expect(handleRowClick).toHaveBeenCalledWith(mockUsers[0])
  })

  it('renders loading skeleton rows when isLoading is true', () => {
    const { container } = render(
      <DataTable
        data={[]}
        columns={columns}
        keyExtractor={(u) => u.id}
        isLoading={true}
      />
    )

    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
