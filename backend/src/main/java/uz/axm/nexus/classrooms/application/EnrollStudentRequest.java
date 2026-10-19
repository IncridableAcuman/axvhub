package uz.axm.nexus.classrooms.application;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollStudentRequest {
    @NotNull(message = "O'quvchi ID raqami kiritilishi shart")
    private Long studentId;
}
