package uz.axm.nexus.grading.application;

import jakarta.annotation.PostConstruct;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.axm.nexus.grading.domain.Achievement;
import uz.axm.nexus.grading.domain.GradeRecord;
import uz.axm.nexus.grading.domain.PointTransaction;
import uz.axm.nexus.grading.domain.StudentAchievement;
import uz.axm.nexus.grading.infrastructure.AchievementRepository;
import uz.axm.nexus.grading.infrastructure.GradeRecordRepository;
import uz.axm.nexus.grading.infrastructure.PointTransactionRepository;
import uz.axm.nexus.grading.infrastructure.StudentAchievementRepository;
import uz.axm.nexus.users.domain.Student;
import uz.axm.nexus.users.infrastructure.StudentRepository;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GradingAndGamificationService {

    private final GradeRecordRepository gradeRecordRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final AchievementRepository achievementRepository;
    private final StudentAchievementRepository studentAchievementRepository;
    private final StudentRepository studentRepository;

    @PostConstruct
    public void initDefaultAchievements() {
        if (achievementRepository.count() == 0) {
            List<Achievement> defaults = List.of(
                    Achievement.builder()
                            .code("FIRST_PERFECT_TEST")
                            .title("100% Natija")
                            .description("Birinchi marta testdan 100 ball to'plash")
                            .icon("Award")
                            .badgeColor("emerald")
                            .category("ASSESSMENT")
                            .xpReward(100)
                            .criteriaType("ASSESSMENT_SCORE")
                            .criteriaThreshold(100)
                            .isActive(true)
                            .build(),
                    Achievement.builder()
                            .code("STREAK_ATTENDANCE_10")
                            .title("Namunali Davomat")
                            .description("Ketma-ket 10 ta darsga kechikmasdan qatnashish")
                            .icon("Flame")
                            .badgeColor("amber")
                            .category("STREAK")
                            .xpReward(150)
                            .criteriaType("ATTENDANCE_STREAK")
                            .criteriaThreshold(10)
                            .isActive(true)
                            .build(),
                    Achievement.builder()
                            .code("PRACTICAL_HERO")
                            .title("Master Dasturchi")
                            .description("3 ta amaliy loyihani a'lo baho bilan topshirish")
                            .icon("Code2")
                            .badgeColor("blue")
                            .category("PROJECT")
                            .xpReward(200)
                            .criteriaType("PROJECTS_COUNT")
                            .criteriaThreshold(3)
                            .isActive(true)
                            .build(),
                    Achievement.builder()
                            .code("POINTS_500_MILESTONE")
                            .title("500 XP Chempioni")
                            .description("Platformada jami 500 ball chegarasini bosib o'tish")
                            .icon("Zap")
                            .badgeColor("purple")
                            .category("MASTERY")
                            .xpReward(50)
                            .criteriaType("TOTAL_POINTS")
                            .criteriaThreshold(500)
                            .isActive(true)
                            .build(),
                    Achievement.builder()
                            .code("POINTS_1000_LEGEND")
                            .title("Nexus Afsonasi")
                            .description("1000 XP ga erishgan oliy toifali o'quvchi")
                            .icon("Trophy")
                            .badgeColor("gold")
                            .category("MASTERY")
                            .xpReward(250)
                            .criteriaType("TOTAL_POINTS")
                            .criteriaThreshold(1000)
                            .isActive(true)
                            .build()
            );
            achievementRepository.saveAll(defaults);
            log.info("Standart gamifikatsiya yutuqlari (Achievements) bazaga yuklandi.");
        }
    }

    // =========================================================================
    // 1. ACADEMIC GRADES (Baholar qaydnomasi)
    // =========================================================================

    @Transactional
    public GradeRecord recordGrade(GradeRecord record) {
        if (record.getScore() == null || record.getScore() < 0 || record.getScore() > 100) {
            throw new IllegalArgumentException("Akademik baho 0 dan 100 gacha bo'lishi shart!");
        }

        record.setLetterGrade(calculateLetterGrade(record.getScore()));
        record.setIsPassing(record.getScore() >= 60);
        record.setCreatedAt(LocalDateTime.now());

        GradeRecord saved = gradeRecordRepository.save(record);

        // Also award gamification XP in a separate audit transaction
        String idempKey = "grade_" + saved.getId() + "_" + System.currentTimeMillis();
        awardPoints(
                record.getStudentId(),
                record.getScore(),
                "ACADEMIC_EVALUATION",
                String.valueOf(saved.getId()),
                "GradeRecord",
                idempKey,
                record.getSubject() + " fanidan " + record.getEvaluationType() + " baholandi: " + record.getScore() + " ball",
                record.getMentorId()
        );

        return saved;
    }

    public List<GradeRecord> getStudentGrades(Long studentId) {
        return gradeRecordRepository.findByStudentId(studentId);
    }

    // =========================================================================
    // 2. GAMIFICATION POINTS & AUDITABLE TRANSACTIONS
    // =========================================================================

    /**
     * Awards points safely with idempotency guarantee to prevent double-spending/duplicate awards.
     */
    @Transactional
    public PointTransaction awardPoints(
            Long studentId,
            int amount,
            String pointSource,
            String referenceId,
            String referenceType,
            String idempotencyKey,
            String reason,
            Long awardedByUserId
    ) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Har bir ball tranzaksiyasi uchun aniq sabab (reason) ko'rsatilishi shart!");
        }

        // Idempotency check: if transaction with this key was already recorded, return it
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            Optional<PointTransaction> existing = pointTransactionRepository.findByIdempotencyKey(idempotencyKey);
            if (existing.isPresent()) {
                log.info("Takroriy ball berish rad etildi (Idempotent): Key={}", idempotencyKey);
                return existing.get();
            }
        }

        PointTransaction tx = PointTransaction.builder()
                .studentId(studentId)
                .amount(amount)
                .pointSource(pointSource != null ? pointSource.toUpperCase() : "GENERAL")
                .referenceId(referenceId)
                .referenceType(referenceType)
                .idempotencyKey(idempotencyKey)
                .reason(reason.trim())
                .awardedByUserId(awardedByUserId)
                .createdAt(LocalDateTime.now())
                .build();

        PointTransaction saved = pointTransactionRepository.save(tx);
        log.info("Ball berildi: StudentID={}, Amount={}, Source={}, Reason={}", studentId, amount, pointSource, reason);

        // Check if this award unlocks new milestone achievements
        checkMilestoneAchievements(studentId);

        return saved;
    }

    /**
     * Traceable score adjustment with explicit justification.
     */
    @Transactional
    public PointTransaction recordAdjustment(Long studentId, int deltaAmount, String reason, Long authorizedUserId) {
        if (reason == null || reason.length() < 5) {
            throw new IllegalArgumentException("Ballni to'g'rilash (Adjustment) uchun batafsil izoh (kamida 5 ta belgi) talab etiladi!");
        }

        String idempKey = "adj_" + studentId + "_" + System.currentTimeMillis();
        return awardPoints(
                studentId,
                deltaAmount,
                "ADJUSTMENT",
                null,
                "ManualAdjustment",
                idempKey,
                "Korrektirovka: " + reason,
                authorizedUserId
        );
    }

    public List<PointTransaction> getStudentPointTransactions(Long studentId) {
        return pointTransactionRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public int getStudentTotalPoints(Long studentId) {
        return pointTransactionRepository.getTotalPointsByStudent(studentId);
    }

    // =========================================================================
    // 3. LEADERBOARDS WITH TIE-BREAKING & PRIVACY MASKING
    // =========================================================================

    public List<LeaderboardEntry> getLeaderboard(String period) {
        LocalDateTime since = null;
        if ("WEEKLY".equalsIgnoreCase(period)) {
            since = LocalDateTime.now().minusDays(7);
        } else if ("MONTHLY".equalsIgnoreCase(period)) {
            since = LocalDateTime.now().minusDays(30);
        }

        List<Object[]> rawData = (since == null)
                ? pointTransactionRepository.getLeaderboardDataAllTime()
                : pointTransactionRepository.getLeaderboardDataSince(since);
        List<LeaderboardEntry> entries = new ArrayList<>();

        Map<Long, Student> studentMap = new HashMap<>();
        List<Student> allStudents = studentRepository.findAll();
        for (Student s : allStudents) {
            studentMap.put(s.getId(), s);
        }

        int rank = 1;
        for (Object[] row : rawData) {
            Long studentId = ((Number) row[0]).longValue();
            int total = ((Number) row[1]).intValue();
            int maxSingle = row[2] != null ? ((Number) row[2]).intValue() : 0;
            LocalDateTime earliest = (LocalDateTime) row[3];

            Student student = studentMap.get(studentId);
            String displayName = maskStudentName(student, studentId);
            String groupName = (student != null && student.getStudyGroup() != null) ? student.getStudyGroup().getGroupCode() : "Biriktirilmagan";
            String gradeLevel = (student != null) ? student.getGradeLevel() : "N/A";

            entries.add(LeaderboardEntry.builder()
                    .rank(rank++)
                    .studentId(studentId)
                    .displayName(displayName)
                    .groupName(groupName)
                    .gradeLevel(gradeLevel)
                    .totalPoints(total)
                    .highestSingleAward(maxSingle)
                    .earliestAchievedAt(earliest)
                    .badgeCount(studentAchievementRepository.findByStudentId(studentId).size())
                    .build());
        }

        return entries;
    }

    public List<GroupLeaderboardEntry> getGroupLeaderboard() {
        List<LeaderboardEntry> individualEntries = getLeaderboard("ALL_TIME");
        Map<String, List<Integer>> groupScores = new HashMap<>();

        for (LeaderboardEntry e : individualEntries) {
            groupScores.computeIfAbsent(e.getGroupName(), k -> new ArrayList<>()).add(e.getTotalPoints());
        }

        List<GroupLeaderboardEntry> groupEntries = new ArrayList<>();
        int rank = 1;
        for (Map.Entry<String, List<Integer>> entry : groupScores.entrySet()) {
            int count = entry.getValue().size();
            int sum = entry.getValue().stream().mapToInt(Integer::intValue).sum();
            double avg = count > 0 ? (double) sum / count : 0.0;

            groupEntries.add(GroupLeaderboardEntry.builder()
                    .rank(0) // sorted below
                    .groupName(entry.getKey())
                    .studentCount(count)
                    .totalPoints(sum)
                    .averagePoints(Math.round(avg * 10.0) / 10.0)
                    .build());
        }

        groupEntries.sort((a, b) -> Double.compare(b.getAveragePoints(), a.getAveragePoints()));
        for (GroupLeaderboardEntry g : groupEntries) {
            g.setRank(rank++);
        }

        return groupEntries;
    }

    public StudentGamificationProfile getStudentProfile(Long studentId) {
        Student student = studentRepository.findById(studentId).orElse(null);
        int totalXP = getStudentTotalPoints(studentId);
        List<PointTransaction> txs = getStudentPointTransactions(studentId);
        List<StudentAchievement> unlocked = studentAchievementRepository.findByStudentId(studentId);
        List<Achievement> allAchievements = achievementRepository.findByIsActiveTrue();

        // Calculate rank in ALL_TIME leaderboard
        List<LeaderboardEntry> lb = getLeaderboard("ALL_TIME");
        int rank = 0;
        for (LeaderboardEntry e : lb) {
            if (e.getStudentId().equals(studentId)) {
                rank = e.getRank();
                break;
            }
        }

        return StudentGamificationProfile.builder()
                .studentId(studentId)
                .displayName(maskStudentName(student, studentId))
                .totalPoints(totalXP)
                .rank(rank > 0 ? rank : lb.size() + 1)
                .recentTransactions(txs.stream().limit(10).toList())
                .unlockedAchievements(unlocked)
                .availableAchievements(allAchievements)
                .build();
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    private void checkMilestoneAchievements(Long studentId) {
        int total = getStudentTotalPoints(studentId);

        if (total >= 500) {
            unlockAchievementIfEligible(studentId, "POINTS_500_MILESTONE");
        }
        if (total >= 1000) {
            unlockAchievementIfEligible(studentId, "POINTS_1000_LEGEND");
        }
    }

    private void unlockAchievementIfEligible(Long studentId, String code) {
        Optional<Achievement> achOpt = achievementRepository.findByCode(code);
        if (achOpt.isPresent()) {
            Achievement ach = achOpt.get();
            Optional<StudentAchievement> alreadyUnlocked = studentAchievementRepository.findByStudentIdAndAchievementId(studentId, ach.getId());
            if (alreadyUnlocked.isEmpty()) {
                StudentAchievement sa = StudentAchievement.builder()
                        .studentId(studentId)
                        .achievementId(ach.getId())
                        .unlockedAt(LocalDateTime.now())
                        .progressValue(ach.getCriteriaThreshold())
                        .build();
                studentAchievementRepository.save(sa);
                log.info("Yutuq ochildi! StudentID={}, Achievement={}", studentId, ach.getTitle());
            }
        }
    }

    /**
     * Privacy-safe display name formatting: "Gulnora Sh. (#I-HR 0220243)"
     */
    private String maskStudentName(Student student, Long studentId) {
        if (student == null) {
            return "Talaba #" + studentId;
        }

        String full = student.getFullName();
        if (full == null || full.isBlank()) {
            return "O'quvchi #" + studentId;
        }

        String[] parts = full.trim().split("\\s+");
        String idBadge = student.getStudentIdNumber() != null ? " (" + student.getStudentIdNumber() + ")" : "";

        if (parts.length == 1) {
            return parts[0] + idBadge;
        } else if (parts.length >= 2) {
            return parts[0] + " " + parts[1].charAt(0) + "." + idBadge;
        }

        return parts[0] + idBadge;
    }

    private String calculateLetterGrade(int score) {
        if (score >= 90) return "A+";
        if (score >= 85) return "A";
        if (score >= 80) return "B+";
        if (score >= 70) return "B";
        if (score >= 60) return "C";
        if (score >= 50) return "D";
        return "F";
    }

    // DTO records
    @Data
    @Builder
    public static class LeaderboardEntry {
        private int rank;
        private Long studentId;
        private String displayName;
        private String groupName;
        private String gradeLevel;
        private int totalPoints;
        private int highestSingleAward;
        private LocalDateTime earliestAchievedAt;
        private int badgeCount;
    }

    @Data
    @Builder
    public static class GroupLeaderboardEntry {
        private int rank;
        private String groupName;
        private int studentCount;
        private int totalPoints;
        private double averagePoints;
    }

    @Data
    @Builder
    public static class StudentGamificationProfile {
        private Long studentId;
        private String displayName;
        private int totalPoints;
        private int rank;
        private List<PointTransaction> recentTransactions;
        private List<StudentAchievement> unlockedAchievements;
        private List<Achievement> availableAchievements;
    }
}
