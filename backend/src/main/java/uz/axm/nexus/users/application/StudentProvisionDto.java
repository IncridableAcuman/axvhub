package uz.axm.nexus.users.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProvisionDto {
    private Long id;
    private String fullName;
    private String studentIdNumber; // HEMIS ID (e.g. "42600001")
    private String temporaryPassword; // Random generated password (shown once upon creation)
    private String gradeLevel;
    private Long studyGroupId;
    private String groupCode;
    private String mentorName;
    private String branchLocation;
    private String phone;
    private String pinfl;
    private String direction;
    private String status;
    private boolean accountCreated;
    private LocalDateTime createdAt;
}
