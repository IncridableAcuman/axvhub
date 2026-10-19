package uz.axm.nexus.users.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.axm.nexus.users.domain.UserPreference;
import uz.axm.nexus.users.infrastructure.UserPreferenceRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserPreferenceService {

    private final UserPreferenceRepository userPreferenceRepository;

    @Transactional
    public UserPreferenceDto getPreferences(Long userId) {
        UserPreference preference = getOrCreatePreference(userId);
        return UserPreferenceDto.fromEntity(preference);
    }

    @Transactional
    public UserPreferenceDto updatePreferences(Long userId, UserPreferenceDto dto) {
        UserPreference preference = getOrCreatePreference(userId);

        if (dto.getLocale() != null && !dto.getLocale().isBlank()) {
            String locale = dto.getLocale().toLowerCase().trim();
            if (locale.equals("uz") || locale.equals("ru") || locale.equals("en")) {
                preference.setLocale(locale);
            }
        }

        if (dto.getTheme() != null && !dto.getTheme().isBlank()) {
            String theme = dto.getTheme().toLowerCase().trim();
            if (theme.equals("light") || theme.equals("dark") || theme.equals("system")) {
                preference.setTheme(theme);
            }
        }

        if (dto.getReducedMotion() != null) {
            preference.setReducedMotion(dto.isReducedMotion());
        }

        if (dto.getDateFormat() != null && !dto.getDateFormat().isBlank()) {
            preference.setDateFormat(dto.getDateFormat());
        }

        preference = userPreferenceRepository.save(preference);
        log.info("Foydalanuvchi #{} sozlamalari yangilandi: locale={}, theme={}, reducedMotion={}",
                userId, preference.getLocale(), preference.getTheme(), preference.isReducedMotion());

        return UserPreferenceDto.fromEntity(preference);
    }

    private UserPreference getOrCreatePreference(Long userId) {
        return userPreferenceRepository.findByUserId(userId)
                .orElseGet(() -> userPreferenceRepository.save(
                        UserPreference.builder()
                                .userId(userId)
                                .locale("uz")
                                .theme("system")
                                .reducedMotion(false)
                                .dateFormat("YYYY-MM-DD")
                                .build()
                ));
    }
}
