package uz.axm.nexus.users.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uz.axm.nexus.users.domain.UserPreference;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferenceDto {
    private Long userId;
    private String locale; // uz, ru, en
    private String theme; // light, dark, system
    @Builder.Default
    private Boolean reducedMotion = false;
    private String dateFormat;

    public boolean isReducedMotion() {
        return Boolean.TRUE.equals(reducedMotion);
    }

    public static UserPreferenceDto fromEntity(UserPreference entity) {
        return UserPreferenceDto.builder()
                .userId(entity.getUserId())
                .locale(entity.getLocale())
                .theme(entity.getTheme())
                .reducedMotion(entity.isReducedMotion())
                .dateFormat(entity.getDateFormat())
                .build();
    }
}
