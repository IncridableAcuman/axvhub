import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AdminDashboardView } from '../AdminDashboardView'
import { I18nProvider } from '@/shared/i18n'
import type { Schedule, Student, Mentor, StudyGroup } from '../../../types'

const mockSchedules: Schedule[] = [
  {
    id: 1,
    gradeLevel: '8-sinf',
    subject: 'Web dasturlash asoslari',
    days: 'Dush-Chor-Jum',
    startTime: '14:00',
    endTime: '15:20',
    room: 'IT Lab 1',
    mentor: {
      id: 1,
      fullName: 'Aziz Rahimov',
      email: 'aziz@example.uz',
      specialization: 'Full-Stack Developer',
    } as Mentor,
    studyGroup: {
      id: 1,
      groupCode: '8-A',
      studentCount: 24,
    } as StudyGroup,
  },
  {
    id: 2,
    gradeLevel: '9-sinf',
    subject: 'Algoritmlar va Ma’lumotlar tuzilmasi',
    days: 'Sesh-Pay-Shan',
    startTime: '15:30',
    endTime: '16:50',
    room: 'IT Lab 2',
    mentor: {
      id: 2,
      fullName: 'Dilshod Karimov',
      email: 'dilshod@example.uz',
      specialization: 'C++ & Algorithms',
    } as Mentor,
    studyGroup: {
      id: 2,
      groupCode: '9-B',
      studentCount: 22,
    } as StudyGroup,
  },
]

const mockStudents: Student[] = [
  { id: 1, fullName: 'Ali Valiyev', gradeLevel: '8-sinf' } as Student,
  { id: 2, fullName: 'Vali Aliyev', gradeLevel: '9-sinf' } as Student,
]

const mockMentors: Mentor[] = [
  { id: 1, fullName: 'Aziz Rahimov', specialization: 'Web' } as Mentor,
  { id: 2, fullName: 'Dilshod Karimov', specialization: 'C++' } as Mentor,
]

const mockGroups: StudyGroup[] = [
  { id: 1, groupCode: '8-A', studentCount: 24 } as StudyGroup,
  { id: 2, groupCode: '9-B', studentCount: 22 } as StudyGroup,
]

describe('AdminDashboardView Shadcn UI Component', () => {
  const defaultProps = {
    currentDateFormatted: '20-oktabr, 2026-yil',
    schedules: mockSchedules,
    students: mockStudents,
    mentors: mockMentors,
    groups: mockGroups,
    onOpenManualModal: vi.fn(),
    onOpenAiModal: vi.fn(),
    onNavigateTab: vi.fn(),
  }

  const renderComponent = (props = defaultProps) => {
    return render(
      <I18nProvider>
        <AdminDashboardView {...props} />
      </I18nProvider>
    )
  }

  it('renders executive banner and KPI cards with Shadcn UI badges', () => {
    renderComponent()

    expect(screen.getByText('Boshqaruv va Monitoring Markazi — AXM Nexus')).toBeInTheDocument()
    expect(screen.getByText('20-oktabr, 2026-yil')).toBeInTheDocument()

    // KPIs values
    expect(screen.getByText('Haftalik Darslar')).toBeInTheDocument()
    expect(screen.getByText('Iqtidorli O‘quvchilar')).toBeInTheDocument()
    expect(screen.getByText('Malakali Mentorlar')).toBeInTheDocument()
    expect(screen.getByText('O‘quv Guruhlari')).toBeInTheDocument()
  })

  it('handles search input filtering of schedule table', () => {
    renderComponent()

    expect(screen.getByText('Web dasturlash asoslari')).toBeInTheDocument()
    expect(screen.getByText('Algoritmlar va Ma’lumotlar tuzilmasi')).toBeInTheDocument()

    // Type in search input
    const searchInput = screen.getByPlaceholderText('Dars, guruh yoki mentor...')
    fireEvent.change(searchInput, { target: { value: 'Algoritmlar' } })

    expect(screen.queryByText('Web dasturlash asoslari')).not.toBeInTheDocument()
    expect(screen.getByText('Algoritmlar va Ma’lumotlar tuzilmasi')).toBeInTheDocument()
  })

  it('toggles between Table view and Grid card view', () => {
    renderComponent()

    const gridBtn = screen.getByLabelText('Grid view')
    fireEvent.click(gridBtn)

    // Should still display subject
    expect(screen.getByText('Web dasturlash asoslari')).toBeInTheDocument()

    const tableBtn = screen.getByLabelText('Table view')
    fireEvent.click(tableBtn)

    expect(screen.getByText('Web dasturlash asoslari')).toBeInTheDocument()
  })

  it('calls onOpenAiModal and onOpenManualModal on button clicks', () => {
    const onOpenAiModal = vi.fn()
    const onOpenManualModal = vi.fn()

    renderComponent({
      ...defaultProps,
      onOpenAiModal,
      onOpenManualModal,
    })

    const aiBtn = screen.getByText('AI Taqsimot & Import')
    fireEvent.click(aiBtn)
    expect(onOpenAiModal).toHaveBeenCalled()

    const manualBtn = screen.getByText('Dars jadvali kiritish')
    fireEvent.click(manualBtn)
    expect(onOpenManualModal).toHaveBeenCalled()
  })

  it('navigates when clicking curriculum or quick shortcuts', () => {
    const onNavigateTab = vi.fn()

    renderComponent({
      ...defaultProps,
      onNavigateTab,
    })

    const curriculumBtn = screen.getByText('8–11 sinf o‘quv rejasi')
    fireEvent.click(curriculumBtn)
    expect(onNavigateTab).toHaveBeenCalledWith('curriculum')

    const usersShortcut = screen.getByText('Foydalanuvchilar')
    fireEvent.click(usersShortcut)
    expect(onNavigateTab).toHaveBeenCalledWith('users')
  })
})
