package uz.axm.nexus.scheduling.application;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAttendanceRequest {
    @NotEmpty(message = "Davomat yozuvlari bo'sh bo'lishi mumkin emas")
    private List<AttendanceItemDto> records;
}
