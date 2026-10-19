import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/shared/ui/toast/Toast';
import { I18nProvider } from '@/shared/i18n';
import { AnalyticsDashboard } from '../analytics/AnalyticsDashboard';
import { AiAssistantInterface } from '../ai/AiAssistantInterface';
import type { StudyGroup, Student, Mentor } from '@/types';

// Mock API modules for Analytics and AI Assistant
vi.mock('@/api', () => ({
  userPreferenceApi: {
    getPreferences: vi.fn().mockResolvedValue({ data: { data: {} } }),
    updatePreferences: vi.fn().mockResolvedValue({ data: { data: {} } }),
  },
  analyticsApi: {
    getOverview: vi.fn().mockResolvedValue({
      data: {
        totalStudents: 45,
        totalMentors: 4,
        activeGroups: 3,
        systemWideAttendanceRate: 94.5,
        systemWideAverageScore: 82.4,
        totalCompletedLessons: 24,
        totalSubmittedAssignments: 50,
        totalEvaluatedAssessments: 30,
        systemTrend: [
          { periodLabel: 'Hafta 1', attendanceRate: 92.0, averageScore: 80.0, lessonsCompleted: 12, assessmentsTaken: 10 },
          { periodLabel: 'Hafta 2', attendanceRate: 96.0, averageScore: 84.8, lessonsCompleted: 12, assessmentsTaken: 20 },
        ],
        groupComparisons: [
          {
            groupId: 10,
            groupCode: 'FN-2026-A',
            gradeLevel: '8-sinf',
            subject: 'Web Full-Stack Development',
            mentorName: 'Sardor Aliyev',
            studentCount: 15,
            attendanceRate: 95.0,
            averageAssessmentScore: 85.0,
            assignmentCompletionRate: 90.0,
            completedLessons: 18,
          },
        ],
        ruleDocumentation: {
          attendanceFormula: 'Davomat = (Hozir + Kechikkan*0.8) / (Rejalashtirilgan - Bekor - Sababli) * 100',
          attendanceDenominatorPolicy: 'Sababli qoldirilgan darslar maxrajdan butunlay chiqarib tashlanadi va davomat foizini tushirmaydi.',
          lessonCompletionFormula: 'Darslar yakunlanishi = O‘tilgan darslar / Rejalashtirilgan darslar * 100',
          assessmentCompletionFormula: 'Baholash yakunlanishi = Topshirilgan testlar / Mavjud testlar * 100',
          averageScoreFormula: 'O‘rtacha ball = Barcha baholashlar ballari yig‘indisi / Baholashlar soni',
          assignmentCompletionFormula: 'Vazifa topshirish = Topshirilgan vazifalar / Biriktirilgan vazifalar * 100',
          auditDisclaimer: 'Barcha ma’lumotlar bazada qat’iy tekshirilgan va o‘zgarmas hisoblanadi.',
        },
      },
    }),
    getGroupAnalytics: vi.fn().mockResolvedValue({
      data: {
        groupId: 10,
        groupCode: 'FN-2026-A',
        gradeLevel: '8-sinf',
        subject: 'Web Full-Stack Development',
        mentorName: 'Sardor Aliyev',
        branchLocation: 'IT Park Yangiariq',
        studentCount: 15,
        totalLessonsPlanned: 24,
        totalLessonsConducted: 18,
        lessonCompletionRate: 75.0,
        averageAttendanceRate: 95.2,
        averageAssessmentScore: 86.4,
        averageAssignmentCompletionRate: 92.0,
        scoreDistribution: { 'A': 8, 'B': 5, 'C': 2 },
        weeklyTrend: [],
        students: [
          {
            studentId: 1,
            studentName: 'Aziz Rahimov',
            studentIdNumber: 'STD-1001',
            attendanceRate: 98.0,
            averageScore: 89.5,
            completedLessons: 18,
            submittedAssignments: 6,
            masteryLevel: 'A’LO',
          },
        ],
        ruleDocumentation: {
          attendanceFormula: 'Davomat = (Hozir + Kechikkan*0.8) / (Rejalashtirilgan - Bekor - Sababli) * 100',
          attendanceDenominatorPolicy: 'Sababli qoldirilgan darslar maxrajdan butunlay chiqarib tashlanadi va davomat foizini tushirmaydi.',
          lessonCompletionFormula: 'Darslar yakunlanishi = O‘tilgan darslar / Rejalashtirilgan darslar * 100',
          assessmentCompletionFormula: 'Baholash yakunlanishi = Topshirilgan testlar / Mavjud testlar * 100',
          averageScoreFormula: 'O‘rtacha ball = Barcha baholashlar ballari yig‘indisi / Baholashlar soni',
          assignmentCompletionFormula: 'Vazifa topshirish = Topshirilgan vazifalar / Biriktirilgan vazifalar * 100',
          auditDisclaimer: 'Barcha ma’lumotlar bazada qat’iy tekshirilgan va o‘zgarmas hisoblanadi.',
        },
      },
    }),
    getStudentAnalytics: vi.fn().mockResolvedValue({
      data: {
        studentId: 1,
        studentName: 'Aziz Rahimov',
        studentIdNumber: 'STD-1001',
        gradeLevel: '8-sinf',
        groupId: 10,
        groupCode: 'FN-2026-A',
        mentorName: 'Sardor Aliyev',
        branchLocation: 'IT Park Yangiariq',
        attendanceRate: 98.0,
        totalScheduledSessions: 20,
        presentCount: 17,
        lateCount: 1,
        absentCount: 0,
        excusedCount: 1,
        completedLessonsCount: 18,
        totalCurriculumLessons: 20,
        lessonCompletionRate: 90.0,
        totalAssessmentsAssigned: 4,
        assessmentsAttempted: 4,
        assessmentCompletionRate: 100.0,
        averageAssessmentScore: 89.5,
        highestAssessmentScore: 95.0,
        lowestAssessmentScore: 85.0,
        totalAssignmentsAssigned: 6,
        assignmentsSubmitted: 6,
        assignmentCompletionRate: 100.0,
        averageAssignmentScore: 92.0,
        overallAverageScore: 90.8,
        masteryLevel: 'A’LO',
        progressOverTime: [],
        ruleDocumentation: {
          attendanceFormula: 'Davomat formulasi',
          attendanceDenominatorPolicy: 'Maxraj siyosati',
          lessonCompletionFormula: 'Dars formulasi',
          assessmentCompletionFormula: 'Baholash formulasi',
          averageScoreFormula: 'Ball formulasi',
          assignmentCompletionFormula: 'Topshiriq formulasi',
          auditDisclaimer: 'Audit bayonnomasi',
        },
      },
    }),
    getRules: vi.fn().mockResolvedValue({
      data: {
        attendanceFormula: 'Davomat = (Hozir + Kechikkan*0.8) / (Rejalashtirilgan - Bekor - Sababli) * 100',
        attendanceDenominatorPolicy: 'Sababli qoldirilgan darslar maxrajdan butunlay chiqarib tashlanadi va davomat foizini tushirmaydi.',
        lessonCompletionFormula: 'Darslar yakunlanishi = O‘tilgan darslar / Rejalashtirilgan darslar * 100',
        assessmentCompletionFormula: 'Baholash yakunlanishi = Topshirilgan testlar / Mavjud testlar * 100',
        averageScoreFormula: 'O‘rtacha ball = Barcha baholashlar ballari yig‘indisi / Baholashlar soni',
        assignmentCompletionFormula: 'Vazifa topshirish = Topshirilgan vazifalar / Biriktirilgan vazifalar * 100',
        auditDisclaimer: 'Barcha ma’lumotlar bazada qat’iy tekshirilgan va o‘zgarmas hisoblanadi.',
      },
    }),
    downloadPdf: vi.fn().mockResolvedValue({
      data: new Blob(['%PDF-1.4 Mock PDF Stream'], { type: 'application/pdf' }),
    }),
  },
  aiAssistantApi: {
    generate: vi.fn().mockResolvedValue({
      data: {
        success: true,
        content: '# Dars Rejasi: Kompyuter Arxitekturasi va Xotira Turlari\n\n80 daqiqalik dars rejasi...',
        role: 'MENTOR_ASSISTANT',
        intent: 'LESSON_PLAN',
        provider: 'mock',
        model: 'offline-pedagogical-engine-v1',
        tokensUsed: 420,
        advisoryDisclaimer: 'DIQQAT: Ushbu reja AI yordamida shakllantirilgan. Mentor dars oldidan tekshirishi shart.',
        generatedLessonPlan: {
          title: 'Kompyuter Arxitekturasi va Kesh Xotira',
          subject: 'Kompyuter Savodxonligi',
          gradeLevel: '8-sinf',
          topic: 'Kompyuter Arxitekturasi',
          learningObjectives: 'Protsessor, registrlar va kesh xotira ishlashini tushunish',
        },
        generatedQuizQuestions: [
          {
            questionText: 'Quyidagilardan qaysi biri eng tezkor xotira hisoblanadi?',
            questionType: 'SINGLE_CHOICE',
            options: ['Registrlar', 'L1 Kesh', 'RAM', 'SSD'],
            correctAnswer: 'Registrlar',
            explanation: 'Registrlar to‘g‘ridan-to‘g‘ri protsessor yadrosida joylashgan eng tezkor xotiradir.',
            points: 10,
          },
        ],
      },
    }),
    convertToLesson: vi.fn().mockResolvedValue({
      data: {
        id: 101,
        title: 'Kompyuter Arxitekturasi va Kesh Xotira',
        status: 'DRAFT',
      },
    }),
    convertToAssessment: vi.fn().mockResolvedValue({
      data: {
        id: 202,
        title: '8-sinf: Web Full-Stack Development bo‘yicha AI Test (Qoralama)',
        isPublished: false,
      },
    }),
    getPrompts: vi.fn().mockResolvedValue({
      data: [
        {
          label: '8-sinf Kompyuter Arxitekturasi',
          prompt: '8-sinf o‘quvchilari uchun kompyuter arxitekturasi mavzusida 80 daqiqalik dars rejasi tuzib ber.',
          intent: 'LESSON_PLAN',
        },
      ],
    }),
  },
}));

// Mock window.URL methods for PDF download
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  window.URL.revokeObjectURL = vi.fn();
}

describe('Modules 12 & 13 Frontend Integration Tests', () => {
  const mockGroups: StudyGroup[] = [
    {
      id: 10,
      groupCode: 'FN-2026-A',
      courseId: 1,
      mentorId: 1,
      gradeLevel: '8-sinf',
      capacity: 20,
      enrolledCount: 15,
      status: 'ACTIVE',
    },
  ];

  const mockStudents: Student[] = [
    {
      id: 1,
      userId: 10,
      groupId: 10,
      fullName: 'Aziz Rahimov',
      gradeLevel: '8-sinf',
      dateOfBirth: '2010-05-12',
      parentPhone: '+998901234567',
      address: 'Toshkent shahar',
      status: 'ACTIVE',
    },
  ];

  const mockMentors: Mentor[] = [
    {
      id: 1,
      userId: 2,
      fullName: 'Sardor Aliyev',
      specialization: 'Full-Stack Web Development',
      status: 'ACTIVE',
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Module 12: AnalyticsDashboard', () => {
    it('renders dashboard with KPI metric cards and verifiable metrics', async () => {
      render(
        <ToastProvider>
          <AnalyticsDashboard groups={mockGroups} students={mockStudents} />
        </ToastProvider>
      );

      // Wait for overview data to load
      await waitFor(() => {
        expect(screen.getByText('Analitika va PDF Hisobotlar')).toBeInTheDocument();
      });

      // Verify KPI metrics are displayed correctly
      expect(screen.getByText('94.5%')).toBeInTheDocument(); // Attendance rate
      expect(screen.getByText('82.4%')).toBeInTheDocument(); // Average score
      expect(screen.getByText('24 ta')).toBeInTheDocument(); // Completed lessons
      expect(screen.getByText('3 / 45')).toBeInTheDocument(); // Groups / Students
    });

    it('switches to Group Analytics view and displays group comparison table', async () => {
      const user = userEvent.setup();
      render(
        <ToastProvider>
          <AnalyticsDashboard groups={mockGroups} students={mockStudents} />
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Guruh Natijalari')).toBeInTheDocument();
      });

      // Click on 'Guruh Natijalari' tab
      await user.click(screen.getByText('Guruh Natijalari'));

      await waitFor(() => {
        expect(screen.getByText(/Guruh: FN-2026-A/i)).toBeInTheDocument();
        expect(screen.getByText('Aziz Rahimov')).toBeInTheDocument();
        expect(screen.getByText('98%')).toBeInTheDocument();
      });
    });

    it('switches to Rules & Formulas view and verifies documented metric calculations', async () => {
      const user = userEvent.setup();
      render(
        <ToastProvider>
          <AnalyticsDashboard groups={mockGroups} students={mockStudents} />
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Qoidalar va Maxrajlar')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Qoidalar va Maxrajlar'));

      await waitFor(() => {
        expect(screen.getByText(/Hisoblash Qoidalari va Shaffoflik Kafolati/i)).toBeInTheDocument();
        expect(screen.getByText(/Sababli qoldirilgan darslar maxrajdan butunlay chiqarib tashlanadi/i)).toBeInTheDocument();
      });
    });

    it('opens PDF Export modal with 8 report types and handles download', async () => {
      const user = userEvent.setup();
      render(
        <ToastProvider>
          <AnalyticsDashboard groups={mockGroups} students={mockStudents} />
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /PDF Hisobot Eksport/i })).toBeInTheDocument();
      });

      // Open PDF modal
      await user.click(screen.getByRole('button', { name: /PDF Hisobot Eksport/i }));

      expect(screen.getByText('Rasmiy PDF Hisobotni Yuklab Olish')).toBeInTheDocument();
      expect(screen.getByText(/2. Guruh Natijalari va Taqqoslama Hisoboti/i)).toBeInTheDocument();
      expect(screen.getByText(/1. O‘quvchining Shaxsiy Progress Hisoboti/i)).toBeInTheDocument();

      // Click Download inside modal
      await user.click(screen.getByRole('button', { name: /PDF Yuklab Olish/i }));

      await waitFor(() => {
        expect(window.URL.createObjectURL).toHaveBeenCalled();
      });
    });

    it('renders localized AnalyticsDashboard in Russian when locale is ru', async () => {
      localStorage.setItem('axm_nexus_locale', 'ru');
      render(
        <I18nProvider>
          <ToastProvider>
            <AnalyticsDashboard groups={mockGroups} students={mockStudents} />
          </ToastProvider>
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Аналитика и PDF-отчеты')).toBeInTheDocument();
        expect(screen.getByText('Модуль 12')).toBeInTheDocument();
        expect(screen.getByText('Правила метрик')).toBeInTheDocument();
        expect(screen.getByText('Экспорт PDF-отчета')).toBeInTheDocument();
      });

      // Verify KPI card labels and units in Russian
      expect(screen.getByText('Средняя посещаемость')).toBeInTheDocument();
      expect(screen.getAllByText('Средний балл').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('Пройденные уроки')).toBeInTheDocument();
      expect(screen.getByText('24 зан.')).toBeInTheDocument();
      expect(screen.getByText('Общий обзор')).toBeInTheDocument();
      expect(screen.getByText('Результаты групп')).toBeInTheDocument();
      expect(screen.getByText('Профиль учащегося')).toBeInTheDocument();
      expect(screen.getByText('Правила и формулы')).toBeInTheDocument();
    });

    it('renders localized AnalyticsDashboard in English when locale is en', async () => {
      localStorage.setItem('axm_nexus_locale', 'en');
      const user = userEvent.setup();
      render(
        <I18nProvider>
          <ToastProvider>
            <AnalyticsDashboard groups={mockGroups} students={mockStudents} />
          </ToastProvider>
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Analytics & PDF Reports')).toBeInTheDocument();
        expect(screen.getByText('Module 12')).toBeInTheDocument();
        expect(screen.getByText('Metric Rules')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /PDF Report Export/i })).toBeInTheDocument();
      });

      // Verify KPI card labels and units in English
      expect(screen.getByText('Average Attendance')).toBeInTheDocument();
      expect(screen.getAllByText('Average Score').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('Conducted Lessons')).toBeInTheDocument();
      expect(screen.getByText('24 lessons')).toBeInTheDocument();
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Group Performance')).toBeInTheDocument();
      expect(screen.getByText('Student Profile')).toBeInTheDocument();
      expect(screen.getByText('Rules & Formulas')).toBeInTheDocument();

      // Open PDF modal in English
      await user.click(screen.getByRole('button', { name: /PDF Report Export/i }));

      expect(screen.getByText('Download Official PDF Report')).toBeInTheDocument();
      expect(screen.getByText(/1. Individual Student Progress Report/i)).toBeInTheDocument();
      expect(screen.getByText(/2. Group Performance & Comparative Report/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Download PDF/i })).toBeInTheDocument();
    });
  });

  describe('Module 13: AiAssistantInterface', () => {
    it('renders assistant interface with Mentor/Student mode switcher and advisory banner', async () => {
      render(
        <ToastProvider>
          <AiAssistantInterface groups={mockGroups} mentors={mockMentors} />
        </ToastProvider>
      );

      expect(screen.getByText('AI Teaching & Learning Assistant')).toBeInTheDocument();
      expect(screen.getByText(/AI maslahat beradi — E’lon qilishdan oldin mentor tekshirishi shart/i)).toBeInTheDocument();
      expect(screen.getByText('Mentor Uchun')).toBeInTheDocument();
      expect(screen.getByText('O‘quvchi Uchun')).toBeInTheDocument();
    });

    it('generates content and displays advisory label and generation result', async () => {
      const user = userEvent.setup();
      render(
        <ToastProvider>
          <AiAssistantInterface groups={mockGroups} mentors={mockMentors} />
        </ToastProvider>
      );

      const input = screen.getByLabelText('AI so‘rov matni');
      await user.type(input, '8-sinf kompyuter arxitekturasi');

      const submitBtn = screen.getByRole('button', { name: /Generatsiya Qilish/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Dars Rejasi: Kompyuter Arxitekturasi va Xotira Turlari/i)).toBeInTheDocument();
        expect(screen.getByText(/DIQQAT: Ushbu reja AI yordamida shakllantirilgan/i)).toBeInTheDocument();
      });
    });

    it('converts AI generated plan into official Lesson draft (Module 08)', async () => {
      const user = userEvent.setup();
      const mockNavigate = vi.fn();
      render(
        <ToastProvider>
          <AiAssistantInterface groups={mockGroups} mentors={mockMentors} onNavigateTab={mockNavigate} />
        </ToastProvider>
      );

      const input = screen.getByLabelText('AI so‘rov matni');
      await user.type(input, 'Kompyuter xotira darsi');
      await user.click(screen.getByRole('button', { name: /Generatsiya Qilish/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Dars Rejasi Sifatida Saqlash/i })).toBeInTheDocument();
      });

      // Click save draft
      await user.click(screen.getByRole('button', { name: /Dars Rejasi Sifatida Saqlash/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('lessons');
      });
    });

    it('converts AI generated quiz questions into official Assessment draft (Module 10)', async () => {
      const user = userEvent.setup();
      const mockNavigate = vi.fn();
      render(
        <ToastProvider>
          <AiAssistantInterface groups={mockGroups} mentors={mockMentors} onNavigateTab={mockNavigate} />
        </ToastProvider>
      );

      const input = screen.getByLabelText('AI so‘rov matni');
      await user.type(input, 'Kompyuter test savollari');
      await user.click(screen.getByRole('button', { name: /Generatsiya Qilish/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Test Savollari Sifatida Saqlash/i })).toBeInTheDocument();
      });

      // Click save assessment draft
      await user.click(screen.getByRole('button', { name: /Test Savollari Sifatida Saqlash/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('assessments');
      });
    });
  });
});
