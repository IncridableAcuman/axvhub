package uz.axm.nexus.users.application;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uz.axm.nexus.users.domain.UserPreference;
import uz.axm.nexus.users.infrastructure.UserPreferenceRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserPreferenceServiceTest {

    @Mock
    private UserPreferenceRepository userPreferenceRepository;

    @InjectMocks
    private UserPreferenceService userPreferenceService;

    @Test
    @DisplayName("1. Foydalanuvchi sozlamalarini olish yoki standart yaratish")
    void testGetPreferences_CreateDefault() {
        Long userId = 10L;
        when(userPreferenceRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(userPreferenceRepository.save(any(UserPreference.class))).thenAnswer(i -> {
            UserPreference p = i.getArgument(0);
            p.setId(1L);
            return p;
        });

        UserPreferenceDto dto = userPreferenceService.getPreferences(userId);

        assertThat(dto.getLocale()).isEqualTo("uz");
        assertThat(dto.getTheme()).isEqualTo("system");
        assertThat(dto.isReducedMotion()).isFalse();
        verify(userPreferenceRepository).save(any(UserPreference.class));
    }

    @Test
    @DisplayName("2. Til va mavzuni muvaffaqiyatli o'zgartirish va saqlash (Persisted preferences & Language switching)")
    void testUpdatePreferences_LanguageAndThemeSwitch() {
        Long userId = 10L;
        UserPreference existing = UserPreference.builder()
                .userId(userId)
                .locale("uz")
                .theme("system")
                .reducedMotion(false)
                .build();
        existing.setId(1L);

        when(userPreferenceRepository.findByUserId(userId)).thenReturn(Optional.of(existing));
        when(userPreferenceRepository.save(any(UserPreference.class))).thenAnswer(i -> i.getArgument(0));

        UserPreferenceDto updateRequest = UserPreferenceDto.builder()
                .locale("ru")
                .theme("dark")
                .reducedMotion(true)
                .dateFormat("DD.MM.YYYY")
                .build();

        UserPreferenceDto result = userPreferenceService.updatePreferences(userId, updateRequest);

        assertThat(result.getLocale()).isEqualTo("ru");
        assertThat(result.getTheme()).isEqualTo("dark");
        assertThat(result.isReducedMotion()).isTrue();
        assertThat(result.getDateFormat()).isEqualTo("DD.MM.YYYY");
        verify(userPreferenceRepository).save(existing);
    }

    @Test
    @DisplayName("3. null reducedMotion yuborilganda mavjud animatsiya sozlamasi saqlanib qolishi kerak")
    void testUpdatePreferences_PreserveReducedMotionWhenNull() {
        Long userId = 10L;
        UserPreference existing = UserPreference.builder()
                .userId(userId)
                .locale("uz")
                .theme("system")
                .reducedMotion(true)
                .build();
        existing.setId(1L);

        when(userPreferenceRepository.findByUserId(userId)).thenReturn(Optional.of(existing));
        when(userPreferenceRepository.save(any(UserPreference.class))).thenAnswer(i -> i.getArgument(0));

        // Request with null reducedMotion (e.g. only changing locale)
        UserPreferenceDto updateRequest = UserPreferenceDto.builder()
                .locale("en")
                .reducedMotion(null)
                .build();

        UserPreferenceDto result = userPreferenceService.updatePreferences(userId, updateRequest);

        assertThat(result.getLocale()).isEqualTo("en");
        // Must preserve existing true value, not overwrite with null/false
        assertThat(result.isReducedMotion()).isTrue();
        verify(userPreferenceRepository).save(existing);
    }

    @Test
    @DisplayName("4. Jackson null bo'lgan boolean qiymatni xatosiz deserialize qilishi kerak")
    void testJacksonDeserialization_WithNullBoolean() throws Exception {
        com.fasterxml.jackson.databind.ObjectMapper mapper = new uz.axm.nexus.shared.infrastructure.JacksonConfig().objectMapper();

        String jsonWithNull = "{\"locale\":\"en\",\"theme\":\"dark\",\"reducedMotion\":null}";
        UserPreferenceDto dto = mapper.readValue(jsonWithNull, UserPreferenceDto.class);

        assertThat(dto).isNotNull();
        assertThat(dto.getLocale()).isEqualTo("en");
        assertThat(dto.getReducedMotion()).isNull();
        assertThat(dto.isReducedMotion()).isFalse(); // Safe getter returns false

        String jsonWithoutField = "{\"locale\":\"ru\"}";
        UserPreferenceDto dtoWithoutField = mapper.readValue(jsonWithoutField, UserPreferenceDto.class);
        assertThat(dtoWithoutField).isNotNull();
        assertThat(dtoWithoutField.getLocale()).isEqualTo("ru");
    }
}
