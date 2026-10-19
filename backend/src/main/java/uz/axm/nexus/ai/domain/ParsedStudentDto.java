package uz.axm.nexus.ai.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParsedStudentDto {
    private Integer orderNumber;
    private String fullName;
    private String pinfl;
    private String studentIdNumber;
    private String district;
    private String gradeLevel;
    private String groupCode;
    private String branchLocation;
    private String phone;
    private String status;
}
