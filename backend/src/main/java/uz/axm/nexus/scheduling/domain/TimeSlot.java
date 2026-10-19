package uz.axm.nexus.scheduling.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlot implements Serializable {
    private String startTime;
    private String endTime;
    private int durationMinutes; // Masalan: 80 daqiqa
}
