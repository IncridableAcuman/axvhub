package uz.axm.nexus.access.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.axm.nexus.access.domain.Permission;
import uz.axm.nexus.access.domain.Role;
import uz.axm.nexus.access.domain.RoleType;
import uz.axm.nexus.access.infrastructure.PermissionRepository;
import uz.axm.nexus.access.infrastructure.RoleRepository;
import uz.axm.nexus.audit.application.AuditService;
import uz.axm.nexus.shared.application.BusinessException;
import uz.axm.nexus.shared.application.ResourceNotFoundException;
import uz.axm.nexus.users.domain.User;
import uz.axm.nexus.users.infrastructure.UserRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RbacService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::toRoleDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PermissionDto> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(this::toPermissionDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public RoleDto updateRolePermissions(Long roleId, Set<String> permissionNames) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Rol topilmadi: #" + roleId));

        Set<Permission> permissions = new HashSet<>();
        for (String permName : permissionNames) {
            Permission perm = permissionRepository.findByName(permName)
                    .orElseThrow(() -> new BusinessException("Ruxsat topilmadi: " + permName));
            permissions.add(perm);
        }

        role.setPermissions(permissions);
        Role saved = roleRepository.save(role);

        auditService.logAction(
                "ROLE_PERMISSIONS_UPDATED",
                "Role",
                String.valueOf(saved.getId()),
                "SYSTEM_ADMIN",
                "Ruxsatlar yangilandi: " + permissionNames
        );

        return toRoleDto(saved);
    }

    @Transactional
    public UserDto assignRolesToUser(Long userId, Set<String> roleNames, String actorUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Foydalanuvchi topilmadi: #" + userId));

        // 1. Prevent unauthorized privilege escalation:
        boolean assigningSuperAdmin = roleNames.stream().anyMatch(r -> normalizeRoleName(r).equals("SUPER_ADMIN") || normalizeRoleName(r).equals("ROLE_SUPER_ADMIN"));
        if (assigningSuperAdmin && actorUsername != null && !actorUsername.equalsIgnoreCase("admin") && !actorUsername.equalsIgnoreCase("system")) {
            User actor = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(actorUsername, actorUsername).orElse(null);
            if (actor != null && !isSuperAdmin(actor)) {
                throw new BusinessException("Ruxsatsiz imtiyozlarni oshirish taqiqlanadi: Faqat Super Administrator boshqalarga Super Admin rolini bera oladi");
            }
        }

        // 2. Prevent removing the last active Super Admin:
        boolean currentlySuperAdmin = isSuperAdmin(user);
        if (currentlySuperAdmin && !assigningSuperAdmin) {
            long activeSuperAdmins = countActiveSuperAdmins();
            if (activeSuperAdmins <= 1) {
                throw new BusinessException("Tizimda oxirgi faol Super Administrator rolini olib tashlab bo'lmaydi!");
            }
        }

        // 3. Resolve role entities
        Set<Role> roles = new HashSet<>();
        for (String rawName : roleNames) {
            String norm = normalizeRoleName(rawName);
            Role role = roleRepository.findByName(norm)
                    .orElseGet(() -> roleRepository.findByName("ROLE_" + norm)
                            .orElseThrow(() -> new BusinessException("Tizimda bunday rol mavjud emas: " + rawName)));
            roles.add(role);
        }

        user.setRoles(roles);
        if (!roles.isEmpty()) {
            String primaryRole = roles.stream()
                    .max(Comparator.comparingInt(r -> RoleType.fromString(r.getName()).getPriority()))
                    .map(Role::getName)
                    .orElseGet(() -> roles.iterator().next().getName());
            user.setRole(primaryRole);
        }

        User savedUser = userRepository.save(user);

        auditService.logAction(
                "USER_ROLES_ASSIGNED",
                "User",
                String.valueOf(savedUser.getId()),
                actorUsername != null ? actorUsername : "ADMIN",
                "Yangi rollar biriktirildi: " + roleNames
        );

        return toUserDto(savedUser);
    }

    @Transactional
    public UserDto revokeRoleFromUser(Long userId, String roleName, String actorUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Foydalanuvchi topilmadi: #" + userId));

        String norm = normalizeRoleName(roleName);

        if ((norm.equals("SUPER_ADMIN") || norm.equals("ROLE_SUPER_ADMIN")) && isSuperAdmin(user)) {
            if (countActiveSuperAdmins() <= 1) {
                throw new BusinessException("Tizimda oxirgi faol Super Administrator rolini bekor qilib bo'lmaydi!");
            }
        }

        user.getRoles().removeIf(r -> normalizeRoleName(r.getName()).equals(norm));
        if (user.getRoles().isEmpty()) {
            throw new BusinessException("Foydalanuvchida kamida bitta rol bo'lishi shart!");
        }
        String primaryRole = user.getRoles().stream()
                .max(Comparator.comparingInt(r -> RoleType.fromString(r.getName()).getPriority()))
                .map(Role::getName)
                .orElseGet(() -> user.getRoles().iterator().next().getName());
        user.setRole(primaryRole);

        User savedUser = userRepository.save(user);

        auditService.logAction(
                "USER_ROLE_REVOKED",
                "User",
                String.valueOf(savedUser.getId()),
                actorUsername != null ? actorUsername : "ADMIN",
                "Rol olib tashlandi: " + roleName
        );

        return toUserDto(savedUser);
    }

    @Transactional
    public UserDto updateUserStatus(Long userId, boolean enabled, String reason, String actorUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Foydalanuvchi topilmadi: #" + userId));

        if (!enabled && isSuperAdmin(user)) {
            if (countActiveSuperAdmins() <= 1) {
                throw new BusinessException("Tizimda oxirgi faol Super Administrator hisobini to'xtatib (suspend) bo'lmaydi!");
            }
        }

        user.setEnabled(enabled);
        User savedUser = userRepository.save(user);

        auditService.logAction(
                enabled ? "USER_ACCOUNT_ACTIVATED" : "USER_ACCOUNT_SUSPENDED",
                "User",
                String.valueOf(savedUser.getId()),
                actorUsername != null ? actorUsername : "ADMIN",
                (enabled ? "Hisob faollashtirildi" : "Hisob to'xtatildi") + (reason != null ? ". Sabab: " + reason : "")
        );

        return toUserDto(savedUser);
    }

    public long countActiveSuperAdmins() {
        return userRepository.findAll().stream()
                .filter(User::isEnabled)
                .filter(this::isSuperAdmin)
                .count();
    }

    public boolean isSuperAdmin(User user) {
        if ("ROLE_ADMIN".equalsIgnoreCase(user.getRole()) || "ROLE_SUPER_ADMIN".equalsIgnoreCase(user.getRole()) || "SUPER_ADMIN".equalsIgnoreCase(user.getRole())) {
            return true;
        }
        if (user.getRoles() != null) {
            return user.getRoles().stream()
                    .anyMatch(r -> {
                        String n = normalizeRoleName(r.getName());
                        return n.equals("SUPER_ADMIN") || n.equals("ROLE_SUPER_ADMIN") || n.equals("ROLE_ADMIN");
                    });
        }
        return false;
    }

    public String normalizeRoleName(String roleName) {
        if (roleName == null) return "";
        String upper = roleName.trim().toUpperCase();
        if (upper.startsWith("ROLE_")) {
            return upper.substring(5);
        }
        return upper;
    }

    public RoleDto toRoleDto(Role role) {
        Set<PermissionDto> permissions = role.getPermissions() != null
                ? role.getPermissions().stream().map(this::toPermissionDto).collect(Collectors.toSet())
                : Collections.emptySet();

        return RoleDto.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .isSystem(role.isSystem())
                .permissions(permissions)
                .build();
    }

    public PermissionDto toPermissionDto(Permission permission) {
        return PermissionDto.builder()
                .id(permission.getId())
                .name(permission.getName())
                .category(permission.getCategory())
                .description(permission.getDescription())
                .build();
    }

    public UserDto toUserDto(User user) {
        List<String> roleNames = new ArrayList<>();
        Set<String> effectivePermissions = new HashSet<>();

        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            for (Role role : user.getRoles()) {
                roleNames.add(role.getName());
                if (role.getPermissions() != null) {
                    for (Permission p : role.getPermissions()) {
                        effectivePermissions.add(p.getName());
                    }
                }
            }
        } else if (user.getRole() != null && !user.getRole().isBlank()) {
            roleNames.add(user.getRole());
            String norm = normalizeRoleName(user.getRole());
            roleRepository.findByName(norm)
                    .or(() -> roleRepository.findByName("ROLE_" + norm))
                    .ifPresent(r -> {
                        if (r.getPermissions() != null) {
                            for (Permission p : r.getPermissions()) {
                                effectivePermissions.add(p.getName());
                            }
                        }
                    });
        }

        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .primaryRole(user.getRole())
                .roles(roleNames)
                .effectivePermissions(effectivePermissions)
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public boolean hasPermission(User user, String permissionName) {
        if (user == null || permissionName == null) return false;
        if (isSuperAdmin(user)) return true;
        if (user.getRoles() != null) {
            for (Role r : user.getRoles()) {
                if (r.getPermissions() != null) {
                    for (Permission p : r.getPermissions()) {
                        if (permissionName.equalsIgnoreCase(p.getName())) {
                            return true;
                        }
                    }
                }
            }
        }
        if (user.getRole() != null) {
            String norm = normalizeRoleName(user.getRole());
            return roleRepository.findByName(norm)
                    .or(() -> roleRepository.findByName("ROLE_" + norm))
                    .map(r -> r.getPermissions() != null && r.getPermissions().stream()
                            .anyMatch(p -> permissionName.equalsIgnoreCase(p.getName())))
                    .orElse(false);
        }
        return false;
    }
}
