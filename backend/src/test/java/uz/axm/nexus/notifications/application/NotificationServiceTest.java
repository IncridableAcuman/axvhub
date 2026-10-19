package uz.axm.nexus.notifications.application;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import uz.axm.nexus.notifications.domain.Notification;
import uz.axm.nexus.notifications.domain.NotificationPreference;
import uz.axm.nexus.notifications.domain.NotificationType;
import uz.axm.nexus.notifications.infrastructure.EmailNotificationDeliveryAdapter;
import uz.axm.nexus.notifications.infrastructure.NotificationPreferenceRepository;
import uz.axm.nexus.notifications.infrastructure.NotificationRepository;
import uz.axm.nexus.shared.application.ResourceNotFoundException;
import uz.axm.nexus.users.domain.User;
import uz.axm.nexus.users.infrastructure.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationPreferenceRepository preferenceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailNotificationDeliveryAdapter emailDeliveryAdapter;

    @InjectMocks
    private NotificationService notificationService;

    private Long userId;
    private NotificationPreference defaultPreference;

    @BeforeEach
    void setUp() {
        userId = 42L;
        defaultPreference = NotificationPreference.builder()
                .userId(userId)
                .inAppEnabled(true)
                .emailEnabled(true)
                .lessonAlerts(true)
                .assignmentAlerts(true)
                .assessmentAlerts(true)
                .announcementAlerts(true)
                .digestFrequency("INSTANT")
                .build();
    }

    @Test
    @DisplayName("1. Muvaffaqiyatli bildirishnoma yaratish va saqlash")
    void testCreateNotification_Success() {
        when(preferenceRepository.findByUserId(userId)).thenReturn(Optional.of(defaultPreference));
        when(notificationRepository.existsByRecipientUserIdAndDeduplicationKeyAndCreatedAtAfter(eq(userId), eq("KEY_1"), any()))
                .thenReturn(false);

        Notification saved = Notification.builder()
                .recipientUserId(userId)
                .title("Dars e'lon qilindi")
                .message("Yangi dars")
                .type(NotificationType.LESSON_PUBLISHED.name())
                .deduplicationKey("KEY_1")
                .read(false)
                .build();
        saved.setId(100L);
        when(notificationRepository.save(any(Notification.class))).thenReturn(saved);

        CreateNotificationRequest request = CreateNotificationRequest.builder()
                .recipientUserId(userId)
                .title("Dars e'lon qilindi")
                .message("Yangi dars")
                .type(NotificationType.LESSON_PUBLISHED.name())
                .deduplicationKey("KEY_1")
                .sendEmail(false)
                .build();

        Optional<NotificationDto> result = notificationService.createNotification(request);

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(100L);
        assertThat(result.get().isRead()).isFalse();
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    @DisplayName("2. Takroriy hodisalar deduplikatsiyasi (Duplicate event suppression)")
    void testCreateNotification_DeduplicationSuppression() {
        when(preferenceRepository.findByUserId(userId)).thenReturn(Optional.of(defaultPreference));
        // Oxirgi 2 soat ichida bir xil kalitli xabarnoma mavjud
        when(notificationRepository.existsByRecipientUserIdAndDeduplicationKeyAndCreatedAtAfter(eq(userId), eq("DEDUP_KEY"), any()))
                .thenReturn(true);

        CreateNotificationRequest request = CreateNotificationRequest.builder()
                .recipientUserId(userId)
                .title("Takroriy eslatma")
                .message("Xabar")
                .type(NotificationType.LESSON_REMINDER.name())
                .deduplicationKey("DEDUP_KEY")
                .build();

        Optional<NotificationDto> result = notificationService.createNotification(request);

        // Deduplikatsiya sababli qayta saqlanmasligi kerak
        assertThat(result).isEmpty();
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    @DisplayName("3. Foydalanuvchi sozlamasi bo'yicha bildirishnomani bekor qilish (Preference filtering)")
    void testCreateNotification_DisabledCategoryPreference() {
        defaultPreference.setLessonAlerts(false); // Foydalanuvchi dars bildirishnomalarini o'chirgan
        when(preferenceRepository.findByUserId(userId)).thenReturn(Optional.of(defaultPreference));

        CreateNotificationRequest request = CreateNotificationRequest.builder()
                .recipientUserId(userId)
                .title("Yangi dars")
                .message("Dars boshlandi")
                .type(NotificationType.LESSON_PUBLISHED.name())
                .build();

        Optional<NotificationDto> result = notificationService.createNotification(request);

        assertThat(result).isEmpty();
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    @DisplayName("4. O'qilganlik holatlarini boshqarish (Mark as read)")
    void testMarkAsRead_Success() {
        Notification notification = Notification.builder()
                .recipientUserId(userId)
                .title("Topshiriq")
                .message("Matn")
                .type("ASSIGNMENT_NEW")
                .read(false)
                .build();
        notification.setId(200L);

        when(notificationRepository.findByIdAndRecipientUserId(200L, userId)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        NotificationDto dto = notificationService.markAsRead(200L, userId);

        assertThat(dto.isRead()).isTrue();
        assertThat(dto.getReadAt()).isNotNull();
        verify(notificationRepository).save(notification);
    }

    @Test
    @DisplayName("5. Boshqa foydalanuvchi bildirishnomasiga ruxsatsiz kirishni taqiqlash (Unauthorized access denial)")
    void testMarkAsRead_UnauthorizedAccess() {
        Long attackerUserId = 999L;
        // Boshqa foydalanuvchining ID si bo'yicha qidirilganda topilmasligi kerak
        when(notificationRepository.findByIdAndRecipientUserId(200L, attackerUserId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markAsRead(200L, attackerUserId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("ruxsat yo'q");

        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    @DisplayName("6. Barcha bildirishnomalarni o'qilgan deb belgilash (Mark all as read)")
    void testMarkAllAsRead() {
        when(notificationRepository.markAllAsReadForUser(eq(userId), any())).thenReturn(5);

        int updatedCount = notificationService.markAllAsRead(userId);

        assertThat(updatedCount).isEqualTo(5);
        verify(notificationRepository).markAllAsReadForUser(eq(userId), any());
    }

    @Test
    @DisplayName("7. Asinxron email yetkazish va xavfsiz sanitizatsiya")
    void testEmailDeliveryAdapter_Sanitization() {
        EmailNotificationDeliveryAdapter adapter = new EmailNotificationDeliveryAdapter(null, null);

        String rawSubject = "Parol tiklash: password=Secret123 va token=xyz987";
        String sanitizedSubject = adapter.sanitizeSubject(rawSubject);
        assertThat(sanitizedSubject).doesNotContain("Secret123");
        assertThat(sanitizedSubject).contains("[XAVFSIZLIK_FILTERI]");

        String rawBody = "Foydalanuvchi ma'lumoti: api_key=abc-secret-key-12345";
        String sanitizedBody = adapter.sanitizeBody(rawBody);
        assertThat(sanitizedBody).doesNotContain("abc-secret-key-12345");
        assertThat(sanitizedBody).contains("[MAXFIY]");
    }
}
