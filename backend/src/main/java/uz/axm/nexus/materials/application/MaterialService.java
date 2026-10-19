package uz.axm.nexus.materials.application;

import org.springframework.stereotype.Service;
import uz.axm.nexus.materials.domain.Material;

import java.util.List;

@Service
public class MaterialService {

    public List<Material> getStaticMaterials() {
        return List.of(
                Material.builder()
                        .id(1L)
                        .title("8-sinf Computer Science o'quv dasturi")
                        .fileType("PDF")
                        .fileUrl("/static/8-sinf Computer Science o'quv dasturi (2).pdf")
                        .gradeLevel("8-sinf")
                        .subject("Computer Science")
                        .build(),
                Material.builder()
                        .id(2L)
                        .title("8-sinf Web Full-stack dasturlash o'quv dasturi")
                        .fileType("PDF")
                        .fileUrl("/static/8-sinf Web Full-stack dasturlash o'quv dasturi latest (2).pdf")
                        .gradeLevel("8-sinf")
                        .subject("Web Full-Stack Development")
                        .build()
        );
    }
}
