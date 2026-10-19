package uz.axm.nexus.scheduling.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceItemDto {
    @NotNull(message = "O'quvchi ID raqami shart")
    private Long studentId;

    private String studentName;

    @NotBlank(message = "Davomat holati shart (PRESENT, ABSENT, LATE, EXCUSED)")
    private String status;

    private String notes;
}
