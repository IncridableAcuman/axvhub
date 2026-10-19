package uz.axm.nexus.analytics.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Rasmiy hisoblash qoidalari va metrikalar shaffofligi hujjati.
 * Qat'iy formula va maxraj qoidalari:
 * 1. Attendance Rate (Davomat %):
 *    - Maxraj (Denominator) = Faol va o'tkazilgan darslar soni (status != 'CANCELLED')
 *    - Sababli qoldirilganlar (EXCUSED) jarimasiz hisoblanadi va maxrajdan chegiriladi: Denominator = (TotalSessions - ExcusedSessions). Agar 0 bo'lsa, 100.0% qabul qilinadi.
 *    - Surat (Numerator) = Hozir bo'lganlar (PRESENT) + Kechikkanlar (LATE * 0.8)
 *    - Bekor qilingan darslar (CANCELLED) hisobga kirmaydi.
 * 2. Completed Lessons:
 *    - O'tilgan yoki o'quvchi tomonidan qatnashilgan darslar (status IN ('COMPLETED', 'ATTENDED')).
 * 3. Assessment Completion Rate:
 *    - (Topshirilgan testlar / Guruh uchun e'lon qilingan testlar) * 100.
 * 4. Average Score:
 *    - Baholangan urinishlar (EVALUATED yoki SUBMITTED) foizlarining arifmetik o'rtachasi.
 * 5. Assignment Completion Rate:
 *    - (Topshirilgan amaliy vazifalar / Faol topshiriqlar) * 100.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetricRuleDocumentationDto {

    @Builder.Default
    private String attendanceFormula = "((PRESENT + (LATE * 0.8)) / (TotalSessions - CANCELLED - EXCUSED)) * 100";

    @Builder.Default
    private String attendanceDenominatorPolicy = "Bekor qilingan darslar (CANCELLED) qat'iyan chiqariladi. Sababli qoldirilganlar (EXCUSED) jarimasiz chegiriladi. Nol bo'lganda 100% deb olinadi.";

    @Builder.Default
    private String lessonCompletionFormula = "(Bajarilgan darslar / Rejalashtirilgan o'quv dasturi darslari) * 100";

    @Builder.Default
    private String assessmentCompletionFormula = "(Topshirilgan test urinishlari / E'lon qilingan testlar soni) * 100";

    @Builder.Default
    private String averageScoreFormula = "Baholangan testlar va amaliy topshiriqlarning umumiy o'rtacha foiz ko'rsatkichi (0.0 - 100.0%)";

    @Builder.Default
    private String assignmentCompletionFormula = "(Topshirilgan topshiriqlar / Biriktirilgan faol vazifalar) * 100";

    @Builder.Default
    private String auditDisclaimer = "Haqiqiy operatsion ma'lumotlar bazasidan hisoblangan. Sinov yoki statik raqamlar ishlatilmaydi.";

    public static MetricRuleDocumentationDto getDefault() {
        return new MetricRuleDocumentationDto();
    }
}
