package uz.axm.nexus.materials.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Material {
    private Long id;
    private String title;
    private String fileType; // PDF, VIDEO, SLIDE, CODE
    private String fileUrl;
    private String gradeLevel;
    private String subject;
}
