import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/shared/ui/toast/Toast';
import { LessonQualityModal } from '../lessons/LessonQualityModal';
import type { LessonPlanDto, Student } from '@/types';

// Mock the API calls
vi.mock('@/api', () => ({
  lessonQualityApi: {
    getQualityPlan: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 1,
          lessonId: 101,
          learningObjectives: '[{"id": "LO-1", "title": "CSS Grid layout tuzish"}]',
          expectedCompetencies: 'Murakkab 2 o‘lchamli to‘rli tartib yaratish',
          requiredPriorKnowledge: 'HTML semantikasi va CSS selektorlari',
          theoryDurationMinutes: 20,
          practicalDurationMinutes: 30,
          teachingMethods: 'Interaktiv kod yozish, Pair programming',
          requiredMaterials: 'VS Code, zamonaviy brauzer',
          assessmentCriteria: 'Kamida 3 ustunli adaptiv grid tuzish',
          expectedStudentOutcomes: 'O‘quvchi mustaqil CSS Grid ishlata oladi',
        },
      },
    }),
    saveQualityPlan: vi.fn().mockResolvedValue({
      data: { success: true, data: { lessonId: 101 } },
    }),
    getDeliveryRecords: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: 1,
            lessonId: 101,
            actualDurationMinutes: 80,
            topicsCovered: 'CSS Grid container va item xususiyatlari',
            practicalExercisesCompleted: 3,
            commonDifficulties: 'grid-template-areas sintaksisi',
            studentParticipationRate: 95,
            homeworkAssigned: 'Katalog kartochkalari griddi',
            topicsRequiringRevision: 'auto-fill vs auto-fit',
            whatWorkedWell: 'Mini loyiha tez tushunildi',
            needsFurtherExplanation: 'auto-fit dinamik moslashuv',
            exerciseDifficulty: 'BALANCED',
            changeNextTime: 'Amaliyotga 5 daqiqa ko‘proq ajratish',
          },
        ],
      },
    }),
    recordDelivery: vi.fn().mockResolvedValue({
      data: { success: true, data: { lessonId: 101 } },
    }),
    getOutcomeEvaluationsByLesson: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: 1,
            lessonId: 101,
            studentId: 1,
            studentName: 'Ali Valiyev',
            objectiveId: 'LO-1',
            objectiveTitle: 'CSS Grid layout tuzish',
            status: 'ACHIEVED',
            evidenceSource: 'QUIZ_RESULT',
            evidenceScore: 92,
            mentorNotes: 'Topshiriqni to‘liq to‘g‘ri bajardi',
          },
        ],
      },
    }),
    saveOutcomeEvaluations: vi.fn().mockResolvedValue({
      data: { success: true, data: [] },
    }),
    getQualityAiSuggestions: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          lessonId: 101,
          topic: 'CSS Grid Asoslari',
          isAdvisory: true,
          disclaimer: 'Ushbu AI tavsiyalari maslahat xarakteriga ega va darsda qo‘llashdan oldin mentor tomonidan ko‘rib chiqilishi shart.',
          alternativeExplanations: ['Shaxmat taxtasi analogiyasi orqali tushuntirish'],
          additionalPracticalExercises: ['Mini kartochkalar galereyasi yaratish'],
          revisionActivities: ['Kahoot orqali 5 daqiqalik tezkor viktorina'],
          lessonPlanImprovements: ['Nazariyani 15 daqiqaga tushirib amaliyotni oshirish'],
        },
      },
    }),
  },
}));

const mockLesson: LessonPlanDto = {
  id: 101,
  title: 'CSS Grid & Flexbox Masterclass',
  subject: 'Web Full-Stack Development',
  gradeLevel: '8-sinf',
  status: 'PUBLISHED',
  estimatedDurationMinutes: 80,
  learningObjectives: 'CSS Grid va Flexbox arxitekturasi',
  expectedOutcomes: 'O‘quvchi adaptiv maketlar yarata oladi',
  theoryDurationMinutes: 20,
  practicalDurationMinutes: 30,
};

const mockStudents: Student[] = [
  {
    id: 1,
    fullName: 'Ali Valiyev',
    gradeLevel: '8-sinf',
    groupId: 10,
    status: 'ACTIVE',
  } as Student,
];

describe('Section 25: LessonQualityModal Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open and displays lesson title and planning tab', async () => {
    render(
      <ToastProvider>
        <LessonQualityModal
          isOpen={true}
          onClose={vi.fn()}
          lesson={mockLesson}
          students={mockStudents}
        />
      </ToastProvider>
    );

    // Check heading
    expect(screen.getByText(/CSS Grid & Flexbox Masterclass/i)).toBeInTheDocument();
    expect(screen.getByText(/Dars Sifati va Ta’lim Natijalari/i)).toBeInTheDocument();

    // Check tabs
    expect(screen.getByRole('button', { name: /Rejalashtirish/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Refleksiya/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Natijalari/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /AI Maslahatchi/i })).toBeInTheDocument();
  });

  it('allows switching to Delivery & Reflection tab and viewing mentor reflection fields', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <LessonQualityModal
          isOpen={true}
          onClose={vi.fn()}
          lesson={mockLesson}
          students={mockStudents}
        />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/CSS Grid & Flexbox Masterclass/i)).toBeInTheDocument();
    });

    const deliveryTab = screen.getByRole('button', { name: /Refleksiya/i });
    await user.click(deliveryTab);

    await waitFor(() => {
      expect(screen.getByText(/Haqiqiy davomiylik/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Mentor Refleksiyasi/i)).toBeInTheDocument();
  });

  it('allows switching to Learning Outcomes tab and shows evidence tracking', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <LessonQualityModal
          isOpen={true}
          onClose={vi.fn()}
          lesson={mockLesson}
          students={mockStudents}
        />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/CSS Grid & Flexbox Masterclass/i)).toBeInTheDocument();
    });

    const outcomesTab = screen.getByRole('button', { name: /Natijalari/i });
    await user.click(outcomesTab);

    await waitFor(() => {
      expect(screen.getByText(/Qat'iy ta’lim tamoyili/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Dalil manbai/i)).toBeInTheDocument();
  });

  it('allows switching to AI Advisory tab and displays suggestions with disclaimer', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <LessonQualityModal
          isOpen={true}
          onClose={vi.fn()}
          lesson={mockLesson}
          students={mockStudents}
        />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/CSS Grid & Flexbox Masterclass/i)).toBeInTheDocument();
    });

    const aiTab = screen.getByRole('button', { name: /AI Maslahatchi/i });
    await user.click(aiTab);

    await waitFor(() => {
      expect(screen.getByText(/Dars Sifatini Yaxshilash bo‘yicha AI Maslahatchisi/i)).toBeInTheDocument();
    });

    // Click to generate/load suggestions
    const generateBtn = screen.getByRole('button', { name: /AI Dars Tavsiyalarini Shakllantirish/i });
    await user.click(generateBtn);

    // Check mandatory disclaimer
    await waitFor(() => {
      expect(screen.getByText(/mentor tomonidan ko‘rib chiqilishi shart/i)).toBeInTheDocument();
    });
  });
});
