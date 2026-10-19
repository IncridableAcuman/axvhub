package uz.axm.nexus.grading.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uz.axm.nexus.grading.domain.PointTransaction;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {

    List<PointTransaction> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    Optional<PointTransaction> findByIdempotencyKey(String idempotencyKey);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PointTransaction p WHERE p.studentId = :studentId")
    int getTotalPointsByStudent(@Param("studentId") Long studentId);

    @Query("SELECT p.studentId, SUM(p.amount) as total, MAX(p.amount) as maxSingle, MIN(p.createdAt) as earliest " +
           "FROM PointTransaction p " +
           "WHERE (:since IS NULL OR p.createdAt >= :since) " +
           "GROUP BY p.studentId " +
           "ORDER BY total DESC, maxSingle DESC, earliest ASC")
    List<Object[]> getLeaderboardData(@Param("since") LocalDateTime since);
}
