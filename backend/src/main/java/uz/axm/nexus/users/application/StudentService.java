package uz.axm.nexus.users.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.axm.nexus.classrooms.domain.StudyGroup;
import uz.axm.nexus.mentors.domain.Mentor;
import uz.axm.nexus.users.domain.Student;
import uz.axm.nexus.users.infrastructure.StudentRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<Student> getByGradeLevel(String gradeLevel) {
        return studentRepository.findByGradeLevel(gradeLevel);
    }

    public List<Student> getByMentorId(Long mentorId) {
        return studentRepository.findByMentorId(mentorId);
    }

    public List<Student> getByGroupId(Long groupId) {
        return studentRepository.findByStudyGroupId(groupId);
    }

    public Optional<Student> findById(Long id) {
        return studentRepository.findById(id);
    }

    @Transactional
    public Student saveStudent(Student student) {
        return studentRepository.save(student);
    }

    @Transactional
    public Student saveOrUpdate(String fullName, String pinfl, String studentIdNumber,
                                String district, String gradeLevel, String branchLocation,
                                String phone, StudyGroup group, Mentor mentor) {
        if (fullName == null || fullName.isBlank()) return null;
        String cleanName = fullName.trim();

        Optional<Student> existingOpt = Optional.empty();
        if (pinfl != null && !pinfl.isBlank()) {
            existingOpt = studentRepository.findByPinfl(pinfl.trim());
        }
        if (existingOpt.isEmpty() && studentIdNumber != null && !studentIdNumber.isBlank()) {
            existingOpt = studentRepository.findByStudentIdNumber(studentIdNumber.trim());
        }
        if (existingOpt.isEmpty()) {
            existingOpt = studentRepository.findByFullNameIgnoreCase(cleanName);
        }

        Student student = existingOpt.orElseGet(() -> Student.builder().fullName(cleanName).build());
        student.setFullName(cleanName);
        if (pinfl != null && !pinfl.isBlank()) student.setPinfl(pinfl.trim());
        if (studentIdNumber != null && !studentIdNumber.isBlank()) student.setStudentIdNumber(studentIdNumber.trim());
        if (district != null) student.setDistrict(district);
        if (gradeLevel != null) student.setGradeLevel(gradeLevel);
        if (branchLocation != null) student.setBranchLocation(branchLocation);
        if (phone != null) student.setPhone(phone);
        if (group != null) student.setStudyGroup(group);
        if (mentor != null) student.setMentor(mentor);
        if (student.getStatus() == null) student.setStatus("Faol");

        return studentRepository.save(student);
    }

    @Transactional
    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }
}
