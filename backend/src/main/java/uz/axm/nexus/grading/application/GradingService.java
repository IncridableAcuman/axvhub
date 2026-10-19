package uz.axm.nexus.grading.application;

import org.springframework.stereotype.Service;
import uz.axm.nexus.grading.domain.Grade;

import java.time.LocalDateTime;

@Service
public class GradingService {

    public Grade evaluateSubmission(Long submissionId, Long studentId, int score, String feedback, Long mentorId) {
        if (score < 0 || score > 100) {
            throw new IllegalArgumentException("Ball 0 dan 100 gacha bo'lishi kerak");
        }

        return Grade.builder()
                .id(System.currentTimeMillis())
                .submissionId(submissionId)
                .studentId(studentId)
                .score(score)
                .feedback(feedback)
                .gradedByMentorId(mentorId)
                .gradedAt(LocalDateTime.now())
                .build();
    }
}
