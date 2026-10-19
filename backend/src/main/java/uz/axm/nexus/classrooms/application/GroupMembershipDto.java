package uz.axm.nexus.classrooms.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMembershipDto {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentGrade;
    private Long groupId;
    private String groupCode;
    private String status;
    private LocalDateTime enrolledAt;
    private LocalDateTime leftAt;
    private String transferReason;
    private Long previousGroupId;
    private String previousGroupCode;
}
