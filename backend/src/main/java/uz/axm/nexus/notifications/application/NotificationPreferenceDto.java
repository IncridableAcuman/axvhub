package uz.axm.nexus.notifications.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uz.axm.nexus.notifications.domain.NotificationPreference;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceDto {
    private Long userId;
    @Builder.Default
    private Boolean inAppEnabled = true;
    @Builder.Default
    private Boolean emailEnabled = true;
    @Builder.Default
    private Boolean lessonAlerts = true;
    @Builder.Default
    private Boolean assignmentAlerts = true;
    @Builder.Default
    private Boolean assessmentAlerts = true;
    @Builder.Default
    private Boolean announcementAlerts = true;
    private String digestFrequency;

    public boolean isInAppEnabled() {
        return inAppEnabled == null || inAppEnabled;
    }

    public boolean isEmailEnabled() {
        return emailEnabled == null || emailEnabled;
    }

    public boolean isLessonAlerts() {
        return lessonAlerts == null || lessonAlerts;
    }

    public boolean isAssignmentAlerts() {
        return assignmentAlerts == null || assignmentAlerts;
    }

    public boolean isAssessmentAlerts() {
        return assessmentAlerts == null || assessmentAlerts;
    }

    public boolean isAnnouncementAlerts() {
        return announcementAlerts == null || announcementAlerts;
    }

    public static NotificationPreferenceDto fromEntity(NotificationPreference entity) {
        return NotificationPreferenceDto.builder()
                .userId(entity.getUserId())
                .inAppEnabled(entity.isInAppEnabled())
                .emailEnabled(entity.isEmailEnabled())
                .lessonAlerts(entity.isLessonAlerts())
                .assignmentAlerts(entity.isAssignmentAlerts())
                .assessmentAlerts(entity.isAssessmentAlerts())
                .announcementAlerts(entity.isAnnouncementAlerts())
                .digestFrequency(entity.getDigestFrequency())
                .build();
    }
}
