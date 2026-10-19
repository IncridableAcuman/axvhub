package uz.axm.nexus.notifications.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final EmailNotificationDeliveryAdapter emailDeliveryAdapter;

    /**
     * Yangi bildirishnoma yaratish (deduplikatsiya va foydalanuvchi sozlamalari tekshiriladi)
     */
    @Transactional
    public Optional<NotificationDto> createNotification(CreateNotificationRequest request) {
        Long recipientId = request.getRecipientUserId();

        // 1. Foydalanuvchi bildirishnoma sozlamalarini tekshirish
        NotificationPreference preference = getOrCreatePreference(recipientId);
        if (!preference.isInAppEnabled()) {
            log.info("Foydalanuvchi #{} in-app bildirishnomalarni o'chirgan, o'tkazib yuborildi", recipientId);
            return Optional.empty();
        }

        if (!isCategoryAllowed(preference, request.getType())) {
            log.info("Foydalanuvchi #{} {} turidagi bildirishnomalarni o'chirgan", recipientId, request.getType());
            return Optional.empty();
        }

        // 2. Takroriy hodisalarni deduplikatsiya qilish (oxirgi 2 soat ichida)
        if (request.getDeduplicationKey() != null && !request.getDeduplicationKey().isBlank()) {
            LocalDateTime threshold = LocalDateTime.now().minusHours(2);
            boolean isDuplicate = notificationRepository.existsByRecipientUserIdAndDeduplicationKeyAndCreatedAtAfter(
                    recipientId,
                    request.getDeduplicationKey(),
                    threshold
            );

            if (isDuplicate) {
                log.info("Deduplikatsiya: Foydalanuvchi #{} uchun takroriy bildirishnoma to'xtatildi (key={})",
                        recipientId, request.getDeduplicationKey());
                return Optional.empty();
            }
        }

        // 3. Bildirishnomani saqlash
        Notification notification = Notification.builder()
                .recipientUserId(recipientId)
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType())
                .deduplicationKey(request.getDeduplicationKey())
                .actionUrl(request.getActionUrl())
                .metadata(request.getMetadata())
                .read(false)
                .build();

        final Notification savedNotification = notificationRepository.save(notification);

        // 4. Agar email sozlamasi faol bo'lsa, asinxron outbox orqali jo'natish
        if (request.isSendEmail() && preference.isEmailEnabled()) {
            Optional<User> recipientUser = userRepository.findById(recipientId);
            recipientUser.ifPresent(u -> {
                if (u.getEmail() != null && !u.getEmail().isBlank()) {
                    emailDeliveryAdapter.enqueueAndDeliverDirectly(
                            savedNotification.getId(),
                            u.getEmail(),
                            savedNotification.getTitle(),
                            savedNotification.getMessage()
                    );
                }
            });
        }

        log.info("Bildirishnoma saqlandi: id={}, recipient={}, type={}",
                savedNotification.getId(), recipientId, savedNotification.getType());

        return Optional.of(NotificationDto.fromEntity(savedNotification));
    }

    /**
     * Xavfsiz qabul qiluvchi filtri bilan foydalanuvchi bildirishnomalari
     */
    @Transactional(readOnly = true)
    public Page<NotificationDto> getUserNotifications(
            Long currentUserId,
            Boolean unreadOnly,
            String type,
            Pageable pageable
    ) {
        Page<Notification> page;

        if (unreadOnly != null && unreadOnly && type != null && !type.isBlank()) {
            page = notificationRepository.findByRecipientUserIdAndTypeAndRead(currentUserId, type, false, pageable);
        } else if (unreadOnly != null && unreadOnly) {
            page = notificationRepository.findByRecipientUserIdAndRead(currentUserId, false, pageable);
        } else if (type != null && !type.isBlank()) {
            page = notificationRepository.findByRecipientUserIdAndType(currentUserId, type, pageable);
        } else {
            page = notificationRepository.findByRecipientUserId(currentUserId, pageable);
        }

        return page.map(NotificationDto::fromEntity);
    }

    /**
     * O'qilmagan bildirishnomalar soni
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(Long currentUserId) {
        return notificationRepository.countByRecipientUserIdAndReadFalse(currentUserId);
    }

    /**
     * Bitta bildirishnomani o'qilgan deb belgilash (xavfsiz egalik tekshiruvi bilan)
     */
    @Transactional
    public NotificationDto markAsRead(Long notificationId, Long currentUserId) {
        Notification notification = notificationRepository.findByIdAndRecipientUserId(notificationId, currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Bildirishnoma topilmadi yoki unga ruxsat yo'q"));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }

        return NotificationDto.fromEntity(notification);
    }

    /**
     * Barcha bildirishnomalarni o'qilgan deb belgilash
     */
    @Transactional
    public int markAllAsRead(Long currentUserId) {
        return notificationRepository.markAllAsReadForUser(currentUserId, LocalDateTime.now());
    }

    /**
     * Bildirishnomani o'chirish (faqat egasi o'chira oladi)
     */
    @Transactional
    public void deleteNotification(Long notificationId, Long currentUserId) {
        Notification notification = notificationRepository.findByIdAndRecipientUserId(notificationId, currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Bildirishnoma topilmadi yoki o'chirishga ruxsat yo'q"));
        notificationRepository.delete(notification);
    }

    /**
     * Foydalanuvchi sozlamalarini olish
     */
    @Transactional
    public NotificationPreferenceDto getPreferences(Long currentUserId) {
        return NotificationPreferenceDto.fromEntity(getOrCreatePreference(currentUserId));
    }

    /**
     * Sozlamalarni yangilash
     */
    @Transactional
    public NotificationPreferenceDto updatePreferences(Long currentUserId, NotificationPreferenceDto dto) {
        NotificationPreference preference = getOrCreatePreference(currentUserId);
        if (dto.getInAppEnabled() != null) {
            preference.setInAppEnabled(dto.isInAppEnabled());
        }
        if (dto.getEmailEnabled() != null) {
            preference.setEmailEnabled(dto.isEmailEnabled());
        }
        if (dto.getLessonAlerts() != null) {
            preference.setLessonAlerts(dto.isLessonAlerts());
        }
        if (dto.getAssignmentAlerts() != null) {
            preference.setAssignmentAlerts(dto.isAssignmentAlerts());
        }
        if (dto.getAssessmentAlerts() != null) {
            preference.setAssessmentAlerts(dto.isAssessmentAlerts());
        }
        if (dto.getAnnouncementAlerts() != null) {
            preference.setAnnouncementAlerts(dto.isAnnouncementAlerts());
        }
        if (dto.getDigestFrequency() != null) {
            preference.setDigestFrequency(dto.getDigestFrequency());
        }
        preference = preferenceRepository.save(preference);
        return NotificationPreferenceDto.fromEntity(preference);
    }

    /**
     * Ommaviy ma'muriy e'lon jo'natish (Broadcast)
     */
    @Transactional
    public int broadcastAnnouncement(BroadcastNotificationRequest request) {
        List<User> targets;
        if (request.getSpecificUserIds() != null && !request.getSpecificUserIds().isEmpty()) {
            targets = userRepository.findAllById(request.getSpecificUserIds());
        } else if (request.getTargetRole() != null && !request.getTargetRole().isBlank()) {
            targets = userRepository.findAll().stream()
                    .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equalsIgnoreCase(request.getTargetRole()))
                            || request.getTargetRole().equalsIgnoreCase(u.getRole()))
                    .toList();
        } else {
            targets = userRepository.findAll();
        }

        int count = 0;
        String dedupBase = "ANNOUNCEMENT_" + System.currentTimeMillis();
        for (User user : targets) {
            CreateNotificationRequest notifRequest = CreateNotificationRequest.builder()
                    .recipientUserId(user.getId())
                    .title(request.getTitle())
                    .message(request.getMessage())
                    .type(NotificationType.ADMIN_ANNOUNCEMENT.name())
                    .deduplicationKey(dedupBase + "_" + user.getId())
                    .actionUrl(request.getActionUrl())
                    .sendEmail(request.isSendEmail())
                    .build();
            if (createNotification(notifRequest).isPresent()) {
                count++;
            }
        }
        log.info("Ommaviy e'lon {} ta foydalanuvchiga muvaffaqiyatli yetkazildi", count);
        return count;
    }

    // =========================================================================
    // YORDAMCHI METODLAR VA DOMAIN EVENT TRIGGERLARI
    // =========================================================================

    public void notifyLessonPublished(Long studentUserId, Long lessonId, String lessonTitle) {
        createNotification(CreateNotificationRequest.builder()
                .recipientUserId(studentUserId)
                .title("Yangi dars rejasi e'lon qilindi")
                .message("«" + lessonTitle + "» dars materiallari va rejasi nashr etildi.")
                .type(NotificationType.LESSON_PUBLISHED.name())
                .deduplicationKey("LESSON_PUB_" + lessonId + "_" + studentUserId)
                .actionUrl("/lessons/" + lessonId)
                .sendEmail(true)
                .build());
    }

    public void notifyLessonRescheduled(Long studentUserId, Long scheduleId, String newTime) {
        createNotification(CreateNotificationRequest.builder()
                .recipientUserId(studentUserId)
                .title("Dars vaqti ko'chirildi")
                .message("Darsingiz yangi vaqtga belgilandi: " + newTime)
                .type(NotificationType.LESSON_RESCHEDULED.name())
                .deduplicationKey("LESSON_RESCHED_" + scheduleId + "_" + studentUserId)
                .actionUrl("/timetable")
                .sendEmail(true)
                .build());
    }

    public void notifyLessonReminder(Long studentUserId, Long scheduleId, String subject, String time) {
        createNotification(CreateNotificationRequest.builder()
                .recipientUserId(studentUserId)
                .title("Dars eslatmasi")
                .message(subject + " darsi tez orada boshlanadi (" + time + ").")
                .type(NotificationType.LESSON_REMINDER.name())
                .deduplicationKey("LESSON_REMIND_" + scheduleId + "_" + studentUserId)
                .actionUrl("/timetable")
                .sendEmail(false)
                .build());
    }

    public void notifyNewAssignment(Long studentUserId, Long assignmentId, String assignmentTitle, String deadline) {
        createNotification(CreateNotificationRequest.builder()
                .recipientUserId(studentUserId)
                .title("Yangi topshiriq biriktirildi")
                .message("«" + assignmentTitle + "» topshirig'i topshirish muddati: " + deadline)
                .type(NotificationType.ASSIGNMENT_NEW.name())
                .deduplicationKey("ASSIGNMENT_NEW_" + assignmentId + "_" + studentUserId)
                .actionUrl("/assessments")
                .sendEmail(true)
                .build());
    }

    public void notifyAssignmentDeadlineApproaching(Long studentUserId, Long assignmentId, String assignmentTitle, String hoursLeft) {
        createNotification(CreateNotificationRequest.builder()
                .recipientUserId(studentUserId)
                .title("Topshiriq muddati yaqinlashmoqda")
                .message("«" + assignmentTitle + "» topshirig'iga " + hoursLeft + " qoldi.")
                .type(NotificationType.ASSIGNMENT_DEADLINE.name())
                .deduplicationKey("ASSIGNMENT_DEADLINE_" + assignmentId + "_" + studentUserId)
                .actionUrl("/assessments")
                .sendEmail(false)
                .build());
    }

    public void notifyAssessmentResult(Long studentUserId, Long attemptId, String assessmentTitle, int score) {
        createNotification(CreateNotificationRequest.builder()
                .recipientUserId(studentUserId)
                .title("Baholash natijasi e'lon qilindi")
                .message("«" + assessmentTitle + "» bo'yicha to'plangan balingiz: " + score)
                .type(NotificationType.ASSESSMENT_RESULT.name())
                .deduplicationKey("ASSESS_RES_" + attemptId + "_" + studentUserId)
                .actionUrl("/grading")
                .sendEmail(true)
                .build());
    }

    public void notifyMentorFeedback(Long studentUserId, Long submissionId, String mentorName) {
        createNotification(CreateNotificationRequest.builder()
                .recipientUserId(studentUserId)
                .title("Ustoz mulohazasi qoldirildi")
                .message(mentorName + " sizning ishingizga yangi taqriz qoldirdi.")
                .type(NotificationType.MENTOR_FEEDBACK.name())
                .deduplicationKey("MENTOR_FB_" + submissionId + "_" + studentUserId)
                .actionUrl("/assessments")
                .sendEmail(true)
                .build());
    }

    public void notifyEnrollmentUpdated(Long studentUserId, String groupName, String status) {
        createNotification(CreateNotificationRequest.builder()
                .recipientUserId(studentUserId)
                .title("Guruhga qabul holati yangilandi")
                .message("«" + groupName + "» guruhiga a'zolik holatingiz: " + status)
                .type(NotificationType.ENROLLMENT_UPDATED.name())
                .deduplicationKey("ENROLL_" + groupName + "_" + studentUserId + "_" + status)
                .actionUrl("/groups")
                .sendEmail(true)
                .build());
    }

    private NotificationPreference getOrCreatePreference(Long userId) {
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> preferenceRepository.save(
                        NotificationPreference.builder()
                                .userId(userId)
                                .inAppEnabled(true)
                                .emailEnabled(true)
                                .lessonAlerts(true)
                                .assignmentAlerts(true)
                                .assessmentAlerts(true)
                                .announcementAlerts(true)
                                .digestFrequency("INSTANT")
                                .build()
                ));
    }

    private boolean isCategoryAllowed(NotificationPreference pref, String type) {
        if (type == null) return true;
        if (type.startsWith("LESSON") && !pref.isLessonAlerts()) return false;
        if (type.startsWith("ASSIGNMENT") && !pref.isAssignmentAlerts()) return false;
        if (type.startsWith("ASSESSMENT") && !pref.isAssessmentAlerts()) return false;
        if (type.equals(NotificationType.ADMIN_ANNOUNCEMENT.name()) && !pref.isAnnouncementAlerts()) return false;
        return true;
    }
}
