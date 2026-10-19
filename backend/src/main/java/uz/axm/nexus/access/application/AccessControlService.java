package uz.axm.nexus.access.application;

import org.springframework.stereotype.Service;
import uz.axm.nexus.access.domain.RoleType;

import java.util.Set;

@Service
public class AccessControlService {

    public boolean canManageSchedules(RoleType role) {
        return role == RoleType.SUPER_ADMIN || role == RoleType.PROGRAM_ADMIN || role == RoleType.REGIONAL_COORDINATOR || role == RoleType.ADMIN || role == RoleType.COORDINATOR;
    }

    public boolean canGradeAssignments(RoleType role) {
        return role == RoleType.SUPER_ADMIN || role == RoleType.PROGRAM_ADMIN || role == RoleType.MENTOR || role == RoleType.ENGLISH_MENTOR || role == RoleType.ADMIN;
    }

    public boolean canManageUsers(RoleType role) {
        return role == RoleType.SUPER_ADMIN || role == RoleType.ADMIN || role == RoleType.PROGRAM_ADMIN;
    }

    public boolean canConfigureSystem(RoleType role) {
        return role == RoleType.SUPER_ADMIN || role == RoleType.ADMIN;
    }

    public Set<String> getPermissionsForRole(RoleType role) {
        return switch (role) {
            case SUPER_ADMIN, ADMIN -> Set.of(
                    "users.read", "users.create", "users.update", "users.disable",
                    "roles.read", "roles.assign", "roles.manage",
                    "lessons.read", "lessons.create", "lessons.update", "lessons.delete", "lessons.publish",
                    "attendance.read", "attendance.record", "attendance.edit",
                    "assessments.read", "assessments.create", "assessments.grade",
                    "reports.read", "reports.export", "analytics.read",
                    "curriculum.read", "curriculum.manage",
                    "materials.read", "materials.manage",
                    "groups.read", "groups.manage",
                    "mentors.read", "mentors.manage",
                    "audit.read", "system.configure"
            );
            case PROGRAM_ADMIN -> Set.of(
                    "users.read", "users.create", "users.update",
                    "roles.read",
                    "lessons.read", "lessons.create", "lessons.update", "lessons.publish",
                    "attendance.read", "attendance.record", "attendance.edit",
                    "assessments.read", "assessments.create", "assessments.grade",
                    "reports.read", "reports.export", "analytics.read",
                    "curriculum.read", "curriculum.manage",
                    "materials.read", "materials.manage",
                    "groups.read", "groups.manage",
                    "mentors.read", "mentors.manage"
            );
            case REGIONAL_COORDINATOR, COORDINATOR -> Set.of(
                    "users.read", "groups.read", "groups.manage",
                    "lessons.read", "lessons.create", "lessons.update",
                    "attendance.read", "reports.read", "reports.export", "analytics.read"
            );
            case MENTOR, ENGLISH_MENTOR -> Set.of(
                    "lessons.read", "lessons.create", "lessons.update",
                    "attendance.read", "attendance.record", "attendance.edit",
                    "assessments.read", "assessments.create", "assessments.grade",
                    "materials.read", "materials.manage",
                    "curriculum.read", "reports.read"
            );
            case CONTENT_MANAGER -> Set.of(
                    "materials.read", "materials.manage",
                    "curriculum.read", "curriculum.manage",
                    "lessons.read", "lessons.create", "lessons.update", "lessons.publish"
            );
            case OBSERVER -> Set.of(
                    "reports.read", "analytics.read", "users.read", "roles.read",
                    "lessons.read", "curriculum.read", "materials.read"
            );
            case STUDENT -> Set.of(
                    "lessons.read", "materials.read", "curriculum.read",
                    "assessments.read", "reports.read"
            );
        };
    }
}

