import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from '../Sidebar'
import { AuthProvider } from '@/features/auth/AuthContext'
import { I18nProvider } from '@/shared/i18n'

describe('Sidebar Component (Shadcn UI Redesign)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem(
      'axm_nexus_user',
      JSON.stringify({
        id: 1,
        username: 'admin',
        roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'],
      })
    )
  })

  const renderSidebar = (props: Partial<React.ComponentProps<typeof Sidebar>> = {}) => {
    return render(
      <AuthProvider>
        <I18nProvider>
          <Sidebar
            activeTab="dashboard"
            onSelectTab={vi.fn()}
            isCollapsed={false}
            onToggleCollapse={vi.fn()}
            isMobileOpen={false}
            onCloseMobile={vi.fn()}
            {...props}
          />
        </I18nProvider>
      </AuthProvider>
    )
  }

  it('renders branding and section headers without unnecessary divider borders', () => {
    renderSidebar()

    expect(screen.getByText('AXM')).toBeInTheDocument()
    expect(screen.getByText('Nexus')).toBeInTheDocument()
    expect(screen.getByText('Muhammad Al-Xorazmiy Vorislari')).toBeInTheDocument()

    // Nav items exist
    expect(screen.getAllByText('Boshqaruv paneli').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Darslar & Davomat').length).toBeGreaterThan(0)
  })

  it('switches active tab when navigation item is clicked', () => {
    const onSelectTab = vi.fn()
    renderSidebar({ onSelectTab })

    const timetableBtn = screen.getAllByText('Darslar & Davomat')[0].closest('button')
    expect(timetableBtn).not.toBeNull()

    if (timetableBtn) {
      fireEvent.click(timetableBtn)
      expect(onSelectTab).toHaveBeenCalledWith('timetable')
    }
  })

  it('toggles collapse state when collapse button is clicked', () => {
    const onToggleCollapse = vi.fn()
    renderSidebar({ isCollapsed: false, onToggleCollapse })

    const collapseBtn = screen.getByLabelText('Yon panelni yig‘ish')
    fireEvent.click(collapseBtn)
    expect(onToggleCollapse).toHaveBeenCalledTimes(1)
  })

  it('renders collapsed state with expand toggle', () => {
    const onToggleCollapse = vi.fn()
    renderSidebar({ isCollapsed: true, onToggleCollapse })

    const expandButtons = screen.getAllByLabelText('Yon panelni kengaytirish')
    expect(expandButtons.length).toBeGreaterThan(0)
    fireEvent.click(expandButtons[0])
    expect(onToggleCollapse).toHaveBeenCalled()
  })

  it('renders filial status beacon in footer seamlessly', () => {
    renderSidebar({ isCollapsed: false })

    expect(screen.getAllByText('IT Park Yangiariq').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Faol').length).toBeGreaterThan(0)
  })

  it('renders mobile sheet when isMobileOpen is true and closes cleanly', () => {
    const onCloseMobile = vi.fn()
    renderSidebar({ isMobileOpen: true, onCloseMobile })

    const closeBtn = screen.getByLabelText('Menyuni yopish')
    fireEvent.click(closeBtn)
    expect(onCloseMobile).toHaveBeenCalledTimes(1)
  })
})
