package uz.axm.nexus.users.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDto {
    private String fullName;
    private String pinfl;
    private String studentIdNumber;
    private String district;
    private String phone;
    private String gradeLevel;
    private String branchLocation;
}
