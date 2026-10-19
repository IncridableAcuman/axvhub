package uz.axm.nexus.mentors.domain;

import jakarta.persistence.*;
import lombok.*;
import uz.axm.nexus.shared.domain.BaseEntity;
import uz.axm.nexus.users.domain.User;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mentor_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mentor_id", unique = true)
    private Mentor mentor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String displayName;

    private String headline; // e.g. "Lead Web Developer & Foundation Mentor"

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Builder.Default
    private Integer yearsOfExperience = 0;

    private String branchLocation;

    private String phone;

    private String email;

    @Builder.Default
    @Column(nullable = false)
    private boolean isContactPublic = false; // Protects private contact info by default

    private String githubUrl;

    private String linkedinUrl;

    private String portfolioUrl;

    private String profilePhotoUrl;

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String publicationStatus = "DRAFT"; // "DRAFT", "PENDING_REVIEW", "APPROVED", "PUBLISHED"

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    private String reviewedBy;

    private LocalDateTime reviewedAt;

    @Builder.Default
    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<MentorSkill> skills = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<MentorExperience> experiences = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<MentorEducation> educations = new ArrayList<>();
}
