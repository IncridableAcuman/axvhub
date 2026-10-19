package uz.axm.nexus.education.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectTrack {
    private String id;
    private String title;
    private String gradeLevel; // "8-sinf", "9-10-sinf", "11-sinf"
    private int totalHours;
    private String description;
    private List<String> modules;
}
