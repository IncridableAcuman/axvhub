package uz.axm.nexus.resources.application;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uz.axm.nexus.resources.domain.LearningResource;
import uz.axm.nexus.resources.infrastructure.LearningResourceRepository;
import uz.axm.nexus.resources.infrastructure.StorageProvider;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LearningResourceServiceTest {

    @Mock
    private LearningResourceRepository resourceRepository;

    @Mock
    private StorageProvider storageProvider;

    @InjectMocks
    private LearningResourceService resourceService;

    private LearningResource sampleResource;

    @BeforeEach
    void setUp() {
        sampleResource = LearningResource.builder()
                .id(1L)
                .title("JavaScript ES6+ To'liq Qo'llanma")
                .description("Zamonaviy JS sintaksisi bo'yicha qo'llanma")
                .resourceType("DOCUMENT")
                .subject("Web Development")
                .gradeLevel("8-sinf")
                .tags("JavaScript, ES6, Frontend")
                .storageKey("sample-uuid-key.pdf")
                .fileName("guide.pdf")
                .fileSize(1024L)
                .mimeType("application/pdf")
                .fileExtension("pdf")
                .publicationStatus("PUBLISHED")
                .downloadCount(0)
                .build();
    }

    @Test
    @DisplayName("searchResources handles null parameters without SQL lower(bytea) error")
    void testSearchResourcesWithNullParameters() {
        when(resourceRepository.searchResources(null, null, null, null))
                .thenReturn(List.of(sampleResource));

        List<LearningResource> result = resourceService.searchResources(null, null, null, null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("JavaScript ES6+ To'liq Qo'llanma");
        verify(resourceRepository, times(1)).searchResources(null, null, null, null);
    }

    @Test
    @DisplayName("searchResources trims and converts type to uppercase")
    void testSearchResourcesWithFilters() {
        when(resourceRepository.searchResources("javascript", "Web Development", "8-sinf", "DOCUMENT"))
                .thenReturn(List.of(sampleResource));

        List<LearningResource> result = resourceService.searchResources("  javascript  ", " Web Development ", " 8-sinf ", "document");

        assertThat(result).hasSize(1);
        verify(resourceRepository, times(1)).searchResources("javascript", "Web Development", "8-sinf", "DOCUMENT");
    }

    @Test
    @DisplayName("getById throws exception when resource does not exist")
    void testGetByIdNotFound() {
        when(resourceRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resourceService.getById(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Resurs topilmadi: 999");
    }
}
