package uz.axm.nexus.lessons.application;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uz.axm.nexus.lessons.domain.Lesson;
import uz.axm.nexus.lessons.domain.LessonRevision;
import uz.axm.nexus.lessons.infrastructure.LessonRepository;
import uz.axm.nexus.lessons.infrastructure.LessonRevisionRepository;
import uz.axm.nexus.lessons.infrastructure.StudentLessonProgressRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LessonServiceTest {

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private LessonRevisionRepository revisionRepository;

    @Mock
    private StudentLessonProgressRepository progressRepository;

    @InjectMocks
    private LessonService lessonService;

    private Lesson draftLesson;

    @BeforeEach
    void setUp() {
        draftLesson = Lesson.builder()
                .id(1L)
                .title("HTML5 Semantik teglar")
                .subject("Web Full-Stack")
                .gradeLevel("8-sinf")
                .topic("Kirish")
                .groupId(10L)
                .status("DRAFT")
                .durationMinutes(80)
                .theoryDurationMinutes(20)
                .practicalDurationMinutes(25)
                .build();
    }

    @Test
    @DisplayName("Dars muvaffaqiyatli yaratilishi va standart 80 daqiqa belgilanishi kerak")
    void shouldCreateLessonSuccessfully() {
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(i -> i.getArgument(0));

        Lesson created = lessonService.createLesson(draftLesson);

        assertThat(created.getTitle()).isEqualTo("HTML5 Semantik teglar");
        assertThat(created.getStatus()).isEqualTo("DRAFT");
        assertThat(created.getDurationMinutes()).isEqualTo(80);
        verify(lessonRepository).save(any(Lesson.class));
    }

    @Test
    @DisplayName("Dars nomi bo'sh bo'lganda IllegalArgumentException tashlanishi kerak")
    void shouldThrowExceptionWhenTitleIsEmpty() {
        draftLesson.setTitle("");

        assertThatThrownBy(() -> lessonService.createLesson(draftLesson))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Dars nomi");
    }

    @Test
    @DisplayName("DRAFT holatidan to'g'ri PUBLISHED holatiga o'tishi kerak")
    void shouldTransitionFromDraftToPublished() {
        when(lessonRepository.findById(1L)).thenReturn(Optional.of(draftLesson));
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(i -> i.getArgument(0));

        Lesson published = lessonService.transitionStatus(1L, "PUBLISHED", "Dars jadvalga muvofiq tayyor");

        assertThat(published.getStatus()).isEqualTo("PUBLISHED");
    }

    @Test
    @DisplayName("Ruxsat berilmagan status sakrashi (masalan, DRAFT dan to'g'ridan-to'g'ri COMPLETED) rad etilishi kerak")
    void shouldRejectIllegalStatusTransition() {
        when(lessonRepository.findById(1L)).thenReturn(Optional.of(draftLesson));

        assertThatThrownBy(() -> lessonService.transitionStatus(1L, "COMPLETED", "Sinov"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("taqiqlangan");
    }

    @Test
    @DisplayName("PUBLISHED dars tahrirlanganda reviziya tarixi saqlanishi kerak")
    void shouldSaveRevisionWhenPublishedLessonIsUpdated() {
        draftLesson.setStatus("PUBLISHED");
        when(lessonRepository.findById(1L)).thenReturn(Optional.of(draftLesson));
        when(revisionRepository.countByLessonId(1L)).thenReturn(0L);
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(i -> i.getArgument(0));

        Lesson updated = Lesson.builder()
                .title("HTML5 Semantik teglar va Formlar")
                .subject("Web Full-Stack")
                .gradeLevel("8-sinf")
                .build();

        lessonService.updateLesson(1L, updated, "mentor1", "Mavzuga formalar qo'shildi");

        verify(revisionRepository).save(any(LessonRevision.class));
        verify(lessonRepository).save(draftLesson);
    }
}
