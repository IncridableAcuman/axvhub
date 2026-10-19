package uz.axm.nexus.education.application;

import org.springframework.stereotype.Service;
import uz.axm.nexus.education.domain.SubjectTrack;

import java.util.List;

@Service
public class EducationService {

    public List<SubjectTrack> getAllTracks() {
        return List.of(
                SubjectTrack.builder()
                        .id("cs-foundation-8")
                        .title("Computer Science Foundation")
                        .gradeLevel("8-sinf")
                        .totalHours(36)
                        .description("Kompyuter arxitekturasi, mantiqiy amallar va dasturlash asoslari.")
                        .modules(List.of("Axborot nazariyasi", "Kompyuter tuzilishi", "Algoritmlar", "Xotira boshqaruvi"))
                        .build(),
                SubjectTrack.builder()
                        .id("web-fullstack-8")
                        .title("Web Full-Stack Development")
                        .gradeLevel("8-sinf")
                        .totalHours(66)
                        .description("HTML5, CSS3, JavaScript ES6+, React va Backend API integratsiyasi.")
                        .modules(List.of("HTML & CSS", "Responsive UI", "Modern JavaScript", "React.js", "REST API integratsiyasi"))
                        .build(),
                SubjectTrack.builder()
                        .id("ai-ml-9-10")
                        .title("Sun'iy intellekt va Machine Learning")
                        .gradeLevel("9-10-sinf")
                        .totalHours(72)
                        .description("Python, ma'lumotlar tahlili, neyron tarmoqlar va LLM modellari.")
                        .modules(List.of("Python Data Science", "Pandas & NumPy", "Supervised Learning", "Deep Learning"))
                        .build(),
                SubjectTrack.builder()
                        .id("portfolio-11")
                        .title("Professional Rivojlanish va Portfolio")
                        .gradeLevel("11-sinf")
                        .totalHours(80)
                        .description("Real loyihalar ishlab chiqish, Git/GitHub, Freelance va xalqaro startaplar ekotizimi.")
                        .modules(List.of("Katta amaliy loyiha", "Code Review & CI/CD", "Freelance platformalar", "Intervyularga tayyorgarlik"))
                        .build()
        );
    }
}
