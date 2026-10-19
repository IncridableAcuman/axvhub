package uz.axm.nexus.scheduling.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateLessonSessionRequest {
    @NotNull(message = "Guruh tanlanishi shart")
    private Long groupId;

    @NotNull(message = "Mentor tanlanishi shart")
    private Long mentorId;

    private Long scheduleId;

    private String room;

    @NotBlank(message = "Fan nomi kiritilishi shart")
    private String subject;

    private String topic;

    @NotNull(message = "Dars sanasi kiritilishi shart")
    private LocalDate lessonDate;

    @NotBlank(message = "Boshlanish vaqti kiritilishi shart (masalan: 15:00)")
    private String startTime;

    @NotBlank(message = "Tugash vaqti kiritilishi shart (masalan: 16:30)")
    private String endTime;

    private String notes;
}
