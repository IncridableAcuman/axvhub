package uz.axm.nexus.access.domain;

public enum RoleType {
    SUPER_ADMIN(100),
    ADMIN(90),
    PROGRAM_ADMIN(80),
    REGIONAL_COORDINATOR(70),
    COORDINATOR(65),
    MENTOR(50),
    ENGLISH_MENTOR(50),
    CONTENT_MANAGER(40),
    OBSERVER(30),
    STUDENT(10);

    private final int priority;

    RoleType(int priority) {
        this.priority = priority;
    }

    public int getPriority() {
        return priority;
    }

    public static RoleType fromString(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            return STUDENT;
        }
        String clean = roleName.trim().toUpperCase();
        if (clean.startsWith("ROLE_")) {
            clean = clean.substring(5);
        }
        try {
            return RoleType.valueOf(clean);
        } catch (IllegalArgumentException e) {
            return STUDENT;
        }
    }
}

