package uz.axm.nexus.reports.application;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import uz.axm.nexus.analytics.application.AnalyticsAuthorizationService;
import uz.axm.nexus.analytics.application.AnalyticsService;
import uz.axm.nexus.analytics.domain.*;
import uz.axm.nexus.users.application.StudentService;
import uz.axm.nexus.users.domain.Student;
import uz.axm.nexus.users.domain.User;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Modul 12: Backend PDF Report Generation Service.
 * - OpenPDF kutubxonasiga asoslangan.
 * - O'zbek (lotin/kirill), rus va ingliz tillaridagi Unicode matnlarni to'liq qo'llab-quvvatlaydi.
 * - Sahifalash (Page X of Y), takrorlanuvchi bosh sarlavhalar va qat'iy avtorizatsiya nazorati.
 * - Aloqasi bo'lmagan shaxslarning ma'lumotlarini himoyalaydi (Data minimization & confidentiality).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PdfReportService {

    private final AnalyticsService analyticsService;
    private final StudentService studentService;
    private final AnalyticsAuthorizationService authorizationService;

    private static final Color BRAND_PRIMARY = new Color(20, 83, 45); // Dark Green #14532D
    private static final Color BRAND_ACCENT = new Color(34, 197, 94); // Light Green
    private static final Color ROW_ALT_BG = new Color(248, 250, 252); // Light Gray
    private static final Color TEXT_MUTED = new Color(100, 116, 139);

    // 1. Shaxsiy o'quvchi hisoboti (Individual Student Progress PDF)
    public byte[] generateIndividualStudentReport(Long studentId, LocalDate from, LocalDate to, User requester) {
        authorizationService.validateStudentAccess(studentId, requester);
        IndividualStudentAnalyticsDto data = analyticsService.getIndividualStudentAnalytics(studentId, from, to, requester);

        return buildPdfDocument("O'quvchining Shaxsiy Rivojlanish Hisoboti", requester, (doc, writer) -> {
            // Student Info Banner
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(15);
            infoTable.setWidths(new float[]{1.0f, 1.0f});

            infoTable.addCell(createKeyValCell("O'quvchi F.I.Sh:", data.getStudentName(), true));
            infoTable.addCell(createKeyValCell("Talaba ID / JSHSHIR:", data.getStudentIdNumber(), false));
            infoTable.addCell(createKeyValCell("Guruh kodi va Sinf:", data.getGroupCode() + " (" + data.getGradeLevel() + ")", true));
            infoTable.addCell(createKeyValCell("Mas'ul Mentor:", data.getMentorName(), false));
            infoTable.addCell(createKeyValCell("Ta'lim filiali:", data.getBranchLocation(), true));
            infoTable.addCell(createKeyValCell("Hisobot davri:", formatPeriod(from, to), false));
            doc.add(infoTable);

            // KPI Grid
            PdfPTable kpiTable = new PdfPTable(4);
            kpiTable.setWidthPercentage(100);
            kpiTable.setSpacingAfter(15);
            kpiTable.setWidths(new float[]{1.0f, 1.0f, 1.0f, 1.0f});

            kpiTable.addCell(createKpiCell("Davomat", data.getAttendanceRate() + "%", BRAND_PRIMARY));
            kpiTable.addCell(createKpiCell("O'rtacha Ball", data.getOverallAverageScore() + "%", BRAND_PRIMARY));
            kpiTable.addCell(createKpiCell("Darslar", data.getCompletedLessonsCount() + " ta", BRAND_PRIMARY));
            kpiTable.addCell(createKpiCell("O'zlashtirish", data.getMasteryLevel(), BRAND_PRIMARY));
            doc.add(kpiTable);

            // Detailed Sections
            addSectionTitle(doc, "1. Davomat ko'rsatkichlari (Metrika qoidalari bo'yicha)");
            PdfPTable attTable = new PdfPTable(5);
            attTable.setWidthPercentage(100);
            attTable.setSpacingAfter(15);
            attTable.setWidths(new float[]{1.2f, 1.0f, 1.0f, 1.0f, 1.0f});
            addTableHeader(attTable, "Rejali Darslar", "Hozir", "Kechikkan", "Sababli", "Sababsiz");
            attTable.addCell(createCell(String.valueOf(data.getTotalScheduledSessions()), Element.ALIGN_CENTER));
            attTable.addCell(createCell(String.valueOf(data.getPresentCount()), Element.ALIGN_CENTER));
            attTable.addCell(createCell(String.valueOf(data.getLateCount()), Element.ALIGN_CENTER));
            attTable.addCell(createCell(String.valueOf(data.getExcusedCount()), Element.ALIGN_CENTER));
            attTable.addCell(createCell(String.valueOf(data.getAbsentCount()), Element.ALIGN_CENTER));
            doc.add(attTable);

            addSectionTitle(doc, "2. Baholash va Topshiriqlar tahlili");
            PdfPTable scoreTable = new PdfPTable(4);
            scoreTable.setWidthPercentage(100);
            scoreTable.setSpacingAfter(15);
            addTableHeader(scoreTable, "Ko'rsatkich", "Rejali / Biriktirilgan", "Bajarilgan / Topshirilgan", "O'rtacha natija");
            scoreTable.addCell(createCell("Oraliq testlar", Element.ALIGN_LEFT));
            scoreTable.addCell(createCell(String.valueOf(data.getTotalAssessmentsAssigned()), Element.ALIGN_CENTER));
            scoreTable.addCell(createCell(data.getAssessmentsAttempted() + " (" + data.getAssessmentCompletionRate() + "%)", Element.ALIGN_CENTER));
            scoreTable.addCell(createCell(data.getAverageAssessmentScore() + "%", Element.ALIGN_CENTER));

            scoreTable.addCell(createCell("Amaliy topshiriqlar", Element.ALIGN_LEFT));
            scoreTable.addCell(createCell(String.valueOf(data.getTotalAssignmentsAssigned()), Element.ALIGN_CENTER));
            scoreTable.addCell(createCell(data.getAssignmentsSubmitted() + " (" + data.getAssignmentCompletionRate() + "%)", Element.ALIGN_CENTER));
            scoreTable.addCell(createCell(data.getAverageAssignmentScore() + "%", Element.ALIGN_CENTER));
            doc.add(scoreTable);

            // Calculation Transparency Note
            addRuleNotice(doc, data.getRuleDocumentation());
        });
    }

    // 2. Guruh ko'rsatkichlari hisoboti (Group Performance PDF)
    public byte[] generateGroupPerformanceReport(Long groupId, LocalDate from, LocalDate to, User requester) {
        authorizationService.validateGroupAccess(groupId, requester);
        GroupAnalyticsDto data = analyticsService.getGroupAnalytics(groupId, from, to, requester);

        return buildPdfDocument("Guruh O'zlashtirishi va Faolligi Hisoboti", requester, (doc, writer) -> {
            PdfPTable info = new PdfPTable(2);
            info.setWidthPercentage(100);
            info.setSpacingAfter(15);
            info.addCell(createKeyValCell("Guruh:", data.getGroupCode() + " (" + data.getGradeLevel() + ")", true));
            info.addCell(createKeyValCell("Fan yo'nalishi:", data.getSubject(), false));
            info.addCell(createKeyValCell("Mas'ul Mentor:", data.getMentorName(), true));
            info.addCell(createKeyValCell("O'quvchilar soni:", data.getStudentCount() + " nafar", false));
            doc.add(info);

            PdfPTable kpiTable = new PdfPTable(4);
            kpiTable.setWidthPercentage(100);
            kpiTable.setSpacingAfter(15);
            kpiTable.addCell(createKpiCell("O'rtacha Davomat", data.getAverageAttendanceRate() + "%", BRAND_PRIMARY));
            kpiTable.addCell(createKpiCell("O'rtacha Natija", data.getAverageAssessmentScore() + "%", BRAND_PRIMARY));
            kpiTable.addCell(createKpiCell("O'tilgan Darslar", data.getTotalLessonsConducted() + " ta", BRAND_PRIMARY));
            kpiTable.addCell(createKpiCell("Topshiriq Bajarilishi", data.getAverageAssignmentCompletionRate() + "%", BRAND_PRIMARY));
            doc.add(kpiTable);

            addSectionTitle(doc, "O'quvchilar kesimidagi individual ko'rsatkichlar");
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{0.6f, 3.5f, 1.8f, 1.4f, 1.4f, 2.0f});
            addTableHeader(table, "№", "F.I.Sh", "Talaba ID", "Davomat", "O'rtacha", "Daraja");

            int idx = 1;
            for (StudentPerformanceSummaryDto s : data.getStudents()) {
                Color bg = (idx % 2 == 0) ? ROW_ALT_BG : Color.WHITE;
                table.addCell(createCell(String.valueOf(idx++), Element.ALIGN_CENTER, bg));
                table.addCell(createCell(s.getStudentName(), Element.ALIGN_LEFT, bg));
                table.addCell(createCell(s.getStudentIdNumber() != null ? s.getStudentIdNumber() : "-", Element.ALIGN_CENTER, bg));
                table.addCell(createCell(s.getAttendanceRate() + "%", Element.ALIGN_CENTER, bg));
                table.addCell(createCell(s.getAverageScore() + "%", Element.ALIGN_CENTER, bg));
                table.addCell(createCell(s.getMasteryLevel(), Element.ALIGN_CENTER, bg));
            }
            doc.add(table);

            addRuleNotice(doc, data.getRuleDocumentation());
        });
    }

    // 3. Test natijalari hisoboti (Assessment Results PDF)
    public byte[] generateAssessmentResultsReport(Long assessmentId, User requester) {
        AssessmentAnalyticsDto data = analyticsService.getAssessmentAnalytics(assessmentId, requester);

        return buildPdfDocument("Test va Baholash Natijalari Tahlili", requester, (doc, writer) -> {
            PdfPTable info = new PdfPTable(2);
            info.setWidthPercentage(100);
            info.setSpacingAfter(15);
            info.addCell(createKeyValCell("Test nomi:", data.getTitle(), true));
            info.addCell(createKeyValCell("Fan va Mavzu:", data.getSubject() + " / " + (data.getTopic() != null ? data.getTopic() : "-"), false));
            info.addCell(createKeyValCell("Maksimal / O'tish bali:", data.getTotalPoints() + " / " + data.getPassingScore(), true));
            info.addCell(createKeyValCell("Ishtirok etganlar:", data.getAttemptCount() + " / " + data.getEligibleStudentsCount() + " (" + data.getParticipationRate() + "%)", false));
            doc.add(info);

            PdfPTable kpiTable = new PdfPTable(4);
            kpiTable.setWidthPercentage(100);
            kpiTable.setSpacingAfter(15);
            kpiTable.addCell(createKpiCell("O'tish Ko'rsatkichi", data.getPassRate() + "%", BRAND_PRIMARY));
            kpiTable.addCell(createKpiCell("O'rtacha Ball", data.getAverageScore() + "%", BRAND_PRIMARY));
            kpiTable.addCell(createKpiCell("Eng Yuqori Ball", data.getHighestScore() + "%", BRAND_PRIMARY));
            kpiTable.addCell(createKpiCell("O'rtacha Vaqt", data.getAverageDurationMinutes() + " daq", BRAND_PRIMARY));
            doc.add(kpiTable);

            addSectionTitle(doc, "Ballar taqsimoti gistogrammasi");
            PdfPTable rangeTable = new PdfPTable(5);
            rangeTable.setWidthPercentage(100);
            rangeTable.setSpacingAfter(15);
            addTableHeader(rangeTable, "90-100% (A'lo)", "80-89% (Yaxshi)", "70-79% (Qoniqarli)", "60-69% (Chegara)", "<60% (Qoniqarsiz)");
            rangeTable.addCell(createCell(data.getScoreRanges().getOrDefault("90-100", 0) + " ta", Element.ALIGN_CENTER));
            rangeTable.addCell(createCell(data.getScoreRanges().getOrDefault("80-89", 0) + " ta", Element.ALIGN_CENTER));
            rangeTable.addCell(createCell(data.getScoreRanges().getOrDefault("70-79", 0) + " ta", Element.ALIGN_CENTER));
            rangeTable.addCell(createCell(data.getScoreRanges().getOrDefault("60-69", 0) + " ta", Element.ALIGN_CENTER));
            rangeTable.addCell(createCell(data.getScoreRanges().getOrDefault("<60", 0) + " ta", Element.ALIGN_CENTER));
            doc.add(rangeTable);
        });
    }

    // 4. Davomat statistikasi hisoboti (Attendance Statistics PDF)
    public byte[] generateAttendanceReport(Long groupId, LocalDate from, LocalDate to, User requester) {
        authorizationService.validateGroupAccess(groupId, requester);
        GroupAnalyticsDto data = analyticsService.getGroupAnalytics(groupId, from, to, requester);

        return buildPdfDocument("Guruh Davomat Statistikasi va Tahlili", requester, (doc, writer) -> {
            Paragraph p = new Paragraph("Guruh: " + data.getGroupCode() + " | Mas'ul: " + data.getMentorName() + " | Davr: " + formatPeriod(from, to), getFont(10, Font.BOLD, TEXT_MUTED));
            p.setSpacingAfter(12);
            doc.add(p);

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{0.8f, 4.0f, 2.0f, 2.0f, 2.0f});
            addTableHeader(table, "№", "O'quvchi F.I.Sh", "Davomat %", "Darslar", "Holati");

            int idx = 1;
            for (StudentPerformanceSummaryDto s : data.getStudents()) {
                Color bg = (idx % 2 == 0) ? ROW_ALT_BG : Color.WHITE;
                table.addCell(createCell(String.valueOf(idx++), Element.ALIGN_CENTER, bg));
                table.addCell(createCell(s.getStudentName(), Element.ALIGN_LEFT, bg));
                table.addCell(createCell(s.getAttendanceRate() + "%", Element.ALIGN_CENTER, bg));
                table.addCell(createCell(s.getCompletedLessons() + " ta dars", Element.ALIGN_CENTER, bg));
                table.addCell(createCell(s.getAttendanceRate() >= 85.0 ? "A'lo" : (s.getAttendanceRate() >= 70.0 ? "Barqaror" : "Xavf ostida"), Element.ALIGN_CENTER, bg));
            }
            doc.add(table);

            addRuleNotice(doc, data.getRuleDocumentation());
        });
    }

    // 5. Darslar o'tilishi hisoboti (Lesson Completion PDF)
    public byte[] generateLessonCompletionReport(Long groupId, User requester) {
        authorizationService.validateGroupAccess(groupId, requester);
        GroupAnalyticsDto data = analyticsService.getGroupAnalytics(groupId, null, null, requester);

        return buildPdfDocument("Dars Rejasi va Mavzular Bajarilishi Hisoboti", requester, (doc, writer) -> {
            PdfPTable info = new PdfPTable(2);
            info.setWidthPercentage(100);
            info.setSpacingAfter(15);
            info.addCell(createKeyValCell("Guruh:", data.getGroupCode() + " (" + data.getGradeLevel() + ")", true));
            info.addCell(createKeyValCell("O'tilgan darslar soni:", data.getTotalLessonsConducted() + " / " + data.getTotalLessonsPlanned(), false));
            doc.add(info);

            Paragraph p = new Paragraph("Rejalashtirilgan o'quv dasturi bo'yicha umumiy bajarilish ko'rsatkichi: " + data.getLessonCompletionRate() + "%", getFont(11, Font.BOLD, BRAND_PRIMARY));
            p.setSpacingAfter(15);
            doc.add(p);
        });
    }

    // 6. Mentor faoliyati hisoboti (Mentor Activity PDF)
    public byte[] generateMentorActivityReport(Long mentorId, LocalDate from, LocalDate to, User requester) {
        MentorActivityAnalyticsDto data = analyticsService.getMentorActivityAnalytics(mentorId, from, to, requester);

        return buildPdfDocument("Mentor Pedagogik Faoliyati va Yuklamasi Hisoboti", requester, (doc, writer) -> {
            PdfPTable info = new PdfPTable(2);
            info.setWidthPercentage(100);
            info.setSpacingAfter(15);
            info.addCell(createKeyValCell("Mentor:", data.getMentorName(), true));
            info.addCell(createKeyValCell("Mutaxassisligi:", data.getRole(), false));
            info.addCell(createKeyValCell("Biriktirilgan guruhlar:", String.join(", ", data.getActiveGroupCodes()), true));
            info.addCell(createKeyValCell("Jami o'quvchilar soni:", data.getTotalAssignedStudents() + " nafar", false));
            doc.add(info);

            PdfPTable kpiTable = new PdfPTable(4);
            kpiTable.setWidthPercentage(100);
            kpiTable.setSpacingAfter(15);
            kpiTable.addCell(createKpiCell("O'tkazilgan darslar", data.getConductedSessionsCount() + " ta", BRAND_PRIMARY));
            kpiTable.addCell(createKpiCell("Tuzilgan testlar", data.getCreatedAssessmentsCount() + " ta", BRAND_PRIMARY));
            kpiTable.addCell(createKpiCell("Baholangan ishlar", (data.getGradedAttemptsCount() + data.getGradedAssignmentsCount()) + " ta", BRAND_PRIMARY));
            kpiTable.addCell(createKpiCell("Davomat yozuvlari", data.getAttendanceRecordsCount() + " ta", BRAND_PRIMARY));
            doc.add(kpiTable);
        });
    }

    // 7. Fan darajasidagi natijalar (Subject-level Performance PDF)
    public byte[] generateSubjectPerformanceReport(LocalDate from, LocalDate to, User requester) {
        List<SubjectPerformanceDto> list = analyticsService.getSubjectLevelPerformance(from, to);

        return buildPdfDocument("Fanlar Kesimida Ta'lim Samaradorligi Hisoboti", requester, (doc, writer) -> {
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3.0f, 1.2f, 1.2f, 1.4f, 1.4f});
            addTableHeader(table, "Fan yo'nalishi", "Guruhlar", "O'quvchilar", "O'rtacha Ball", "Davomat");

            for (SubjectPerformanceDto s : list) {
                table.addCell(createCell(s.getSubject(), Element.ALIGN_LEFT));
                table.addCell(createCell(String.valueOf(s.getTotalGroups()), Element.ALIGN_CENTER));
                table.addCell(createCell(String.valueOf(s.getTotalStudents()), Element.ALIGN_CENTER));
                table.addCell(createCell(s.getAverageAssessmentScore() + "%", Element.ALIGN_CENTER));
                table.addCell(createCell(s.getAverageAttendanceRate() + "%", Element.ALIGN_CENTER));
            }
            doc.add(table);
        });
    }

    // 8. O'quv davri jamlangan hisoboti (Academic Period Summary PDF)
    public byte[] generateAcademicPeriodSummaryReport(Long periodId, User requester) {
        AcademicPeriodSummaryDto data = analyticsService.getAcademicPeriodSummary(periodId, requester);

        return buildPdfDocument("O'quv Davri (Semestr) Yakuniy Hisoboti", requester, (doc, writer) -> {
            PdfPTable info = new PdfPTable(2);
            info.setWidthPercentage(100);
            info.setSpacingAfter(15);
            info.addCell(createKeyValCell("O'quv davri:", data.getPeriodName() + " (" + data.getPeriodCode() + ")", true));
            info.addCell(createKeyValCell("Boshlanish / Tugash:", data.getStartDate() + " — " + data.getEndDate(), false));
            info.addCell(createKeyValCell("Guruhlar va O'quvchilar:", data.getTotalGroups() + " guruh / " + data.getTotalStudents() + " o'quvchi", true));
            info.addCell(createKeyValCell("Jami o'tkazilgan darslar:", data.getTotalSessionsConducted() + " mashg'ulot", false));
            doc.add(info);

            PdfPTable kpiTable = new PdfPTable(3);
            kpiTable.setWidthPercentage(100);
            kpiTable.setSpacingAfter(15);
            kpiTable.addCell(createKpiCell("Umumiy Davomat", data.getOverallAttendanceRate() + "%", BRAND_PRIMARY));
            kpiTable.addCell(createKpiCell("Umumiy Ball", data.getOverallAssessmentAverage() + "%", BRAND_PRIMARY));
            kpiTable.addCell(createKpiCell("Vazifalar Bajarilishi", data.getOverallAssignmentCompletionRate() + "%", BRAND_PRIMARY));
            doc.add(kpiTable);

            addSectionTitle(doc, "Guruhlar kesimidagi taqqoslama");
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.5f, 1.2f, 2.5f, 1.2f, 1.2f, 1.2f});
            addTableHeader(table, "Guruh", "Sinf", "Mentor", "Davomat", "Ball", "Darslar");

            for (GroupComparisonDto g : data.getGroupSummaries()) {
                table.addCell(createCell(g.getGroupCode(), Element.ALIGN_CENTER));
                table.addCell(createCell(g.getGradeLevel(), Element.ALIGN_CENTER));
                table.addCell(createCell(g.getMentorName(), Element.ALIGN_LEFT));
                table.addCell(createCell(g.getAttendanceRate() + "%", Element.ALIGN_CENTER));
                table.addCell(createCell(g.getAverageAssessmentScore() + "%", Element.ALIGN_CENTER));
                table.addCell(createCell(g.getCompletedLessons() + " ta", Element.ALIGN_CENTER));
            }
            doc.add(table);

            addRuleNotice(doc, data.getRuleDocumentation());
        });
    }

    // Common PDF Builder with Header/Footer event and Unicode support
    private byte[] buildPdfDocument(String reportTitle, User requester, DocumentWriterConsumer consumer) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 48, 48);
            PdfWriter writer = PdfWriter.getInstance(document, out);

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            String callerInfo = (requester != null) ? requester.getFullName() + " (" + requester.getRole() + ")" : "Tizim avtorizatsiyalangan foydalanuvchisi";

            HeaderFooterPageEvent event = new HeaderFooterPageEvent(reportTitle, timestamp, callerInfo);
            writer.setPageEvent(event);

            document.open();

            // Main Document Header
            Paragraph orgName = new Paragraph("AXM NEXUS — AL-XORAZMIY VORISLARI TA'LIM TIZIMI", getFont(13, Font.BOLD, BRAND_PRIMARY));
            orgName.setAlignment(Element.ALIGN_CENTER);
            document.add(orgName);

            Paragraph docTitle = new Paragraph(reportTitle, getFont(16, Font.BOLD, Color.BLACK));
            docTitle.setAlignment(Element.ALIGN_CENTER);
            docTitle.setSpacingAfter(4);
            document.add(docTitle);

            Paragraph meta = new Paragraph("Yaratilgan vaqti: " + timestamp + " | So'rovchi: " + callerInfo, getFont(8, Font.NORMAL, TEXT_MUTED));
            meta.setAlignment(Element.ALIGN_CENTER);
            meta.setSpacingAfter(18);
            document.add(meta);

            // Execute content writer
            consumer.accept(document, writer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("PDF hisobot yaratishda xatolik: {}", e.getMessage(), e);
            throw new RuntimeException("PDF hisobot shakllantirilmadi: " + e.getMessage(), e);
        }
    }

    @FunctionalInterface
    private interface DocumentWriterConsumer {
        void accept(Document doc, PdfWriter writer) throws Exception;
    }

    // Header & Footer Page Event Helper with page numbering
    private class HeaderFooterPageEvent extends PdfPageEventHelper {
        private final String reportTitle;
        private final String timestamp;
        private final String callerInfo;

        public HeaderFooterPageEvent(String reportTitle, String timestamp, String callerInfo) {
            this.reportTitle = reportTitle;
            this.timestamp = timestamp;
            this.callerInfo = callerInfo;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();

            // Running Header (only on page 2 and later)
            if (writer.getPageNumber() > 1) {
                ColumnText.showTextAligned(cb, Element.ALIGN_LEFT,
                        new Phrase("AXM Nexus: " + reportTitle, getFont(7, Font.NORMAL, TEXT_MUTED)),
                        document.leftMargin(), document.top() + 15, 0);

                ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                        new Phrase(timestamp, getFont(7, Font.NORMAL, TEXT_MUTED)),
                        document.right(), document.top() + 15, 0);
            }

            // Running Footer (on all pages)
            String pageNum = "Sahifa " + writer.getPageNumber();
            ColumnText.showTextAligned(cb, Element.ALIGN_LEFT,
                    new Phrase("Rasmiy axborot hujjati — Faqat vakolatli xodimlar uchun", getFont(7, Font.ITALIC, TEXT_MUTED)),
                    document.leftMargin(), document.bottom() - 15, 0);

            ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                    new Phrase(pageNum, getFont(8, Font.BOLD, BRAND_PRIMARY)),
                    document.right(), document.bottom() - 15, 0);
        }
    }

    // Font factory supporting Unicode characters (Uzbek Latin & Cyrillic)
    private Font getFont(float size, int style, Color color) {
        try {
            File dejavu = new File("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf");
            if (dejavu.exists()) {
                BaseFont bf = BaseFont.createFont(dejavu.getAbsolutePath(), BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
                return new Font(bf, size, style, color);
            }
            File liberation = new File("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf");
            if (liberation.exists()) {
                BaseFont bf = BaseFont.createFont(liberation.getAbsolutePath(), BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
                return new Font(bf, size, style, color);
            }
        } catch (Exception ignored) {
        }
        return FontFactory.getFont(FontFactory.HELVETICA, size, style, color);
    }

    // Helper table cells
    private void addTableHeader(PdfPTable table, String... headers) {
        Font headerFont = getFont(9, Font.BOLD, Color.WHITE);
        table.setHeaderRows(1);
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(BRAND_PRIMARY);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setPadding(6);
            table.addCell(cell);
        }
    }

    private PdfPCell createCell(String text, int align) {
        return createCell(text, align, Color.WHITE);
    }

    private PdfPCell createCell(String text, int align, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "-", getFont(8.5f, Font.NORMAL, Color.DARK_GRAY)));
        cell.setHorizontalAlignment(align);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(5);
        cell.setBackgroundColor(bg);
        return cell;
    }

    private PdfPCell createKeyValCell(String label, String val, boolean isLeft) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(3);
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + " ", getFont(8.5f, Font.BOLD, BRAND_PRIMARY)));
        p.add(new Chunk(val != null ? val : "-", getFont(8.5f, Font.NORMAL, Color.BLACK)));
        cell.addElement(p);
        return cell;
    }

    private PdfPCell createKpiCell(String title, String value, Color color) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(new Color(241, 245, 249)); // Slate 100
        cell.setBorderColor(new Color(226, 232, 240));
        cell.setPadding(8);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph valP = new Paragraph(value, getFont(13, Font.BOLD, color));
        valP.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(valP);

        Paragraph titleP = new Paragraph(title, getFont(8, Font.NORMAL, TEXT_MUTED));
        titleP.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(titleP);

        return cell;
    }

    private void addSectionTitle(Document doc, String title) throws DocumentException {
        Paragraph p = new Paragraph(title, getFont(10, Font.BOLD, BRAND_PRIMARY));
        p.setSpacingBefore(8);
        p.setSpacingAfter(6);
        doc.add(p);
    }

    private void addRuleNotice(Document doc, MetricRuleDocumentationDto rules) throws DocumentException {
        if (rules == null) return;
        Paragraph p = new Paragraph("Metrika hisoblash qoidasi: " + rules.getAttendanceDenominatorPolicy(), getFont(7.5f, Font.ITALIC, TEXT_MUTED));
        p.setSpacingBefore(12);
        doc.add(p);
    }

    private String formatPeriod(LocalDate from, LocalDate to) {
        if (from != null && to != null) return from + " dan " + to + " gacha";
        if (from != null) return from + " dan hozirgacha";
        if (to != null) return to + " gacha";
        return "Joriy o'quv davri (3 oylik)";
    }

    public static String sanitizeFilename(String raw) {
        if (raw == null || raw.isBlank()) return "report.pdf";
        String clean = raw.replaceAll("[^a-zA-Z0-9_-]", "_");
        return clean + ".pdf";
    }
}
