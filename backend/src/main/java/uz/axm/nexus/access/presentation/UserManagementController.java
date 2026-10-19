package uz.axm.nexus.access.presentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uz.axm.nexus.access.application.*;
import uz.axm.nexus.shared.application.ApiResponse;
import uz.axm.nexus.shared.application.PageResponse;
import uz.axm.nexus.shared.infrastructure.CurrentUserHelper;
import uz.axm.nexus.users.domain.User;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management & RBAC", description = "Foydalanuvchilar katalogi, ko'p rolli RBAC boshqaruvi va hisoblar holati")
public class UserManagementController {

    private final UserManagementService userManagementService;
    private final RbacService rbacService;
    private final CurrentUserHelper currentUserHelper;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'PROGRAM_ADMIN', 'REGIONAL_COORDINATOR', 'COORDINATOR', 'OBSERVER') or hasAuthority('users.read')")
    @Operation(summary = "Foydalanuvchilarni qidirish, filtrlash va sahifalab olish")
    public ResponseEntity<ApiResponse<PageResponse<UserDto>>> getUsers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        PageResponse<UserDto> response = userManagementService.searchUsers(query, role, enabled, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.ok("Foydalanuvchilar ro'yxati olindi", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'PROGRAM_ADMIN', 'REGIONAL_COORDINATOR', 'COORDINATOR', 'OBSERVER') or hasAuthority('users.read')")
    @Operation(summary = "Foydalanuvchi batafsil ma'lumotlarini (rollar va ruxsatlar bilan) olish")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        UserDto dto = userManagementService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok("Foydalanuvchi ma'lumotlari olindi", dto));
    }

    @PutMapping("/{id}/roles")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN') or hasAuthority('roles.assign')")
    @Operation(summary = "Foydalanuvchiga bir vaqtda bir nechta rollarni biriktirish (Multi-Role)")
    public ResponseEntity<ApiResponse<UserDto>> assignRoles(
            @PathVariable Long id,
            @Valid @RequestBody AssignRolesRequest request,
            @RequestHeader(value = "X-Admin-User", required = false, defaultValue = "admin") String actor
    ) {
        String effectiveActor = currentUserHelper.getCurrentUser().map(User::getUsername).orElse(actor);
        UserDto dto = rbacService.assignRolesToUser(id, request.getRoles(), effectiveActor);
        return ResponseEntity.ok(ApiResponse.ok("Foydalanuvchi rollari muvaffaqiyatli yangilandi", dto));
    }

    @DeleteMapping("/{id}/roles/{roleName}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN') or hasAuthority('roles.assign')")
    @Operation(summary = "Foydalanuvchidan ma'lum rolni bekor qilish (Revoke Role)")
    public ResponseEntity<ApiResponse<UserDto>> revokeRole(
            @PathVariable Long id,
            @PathVariable String roleName,
            @RequestHeader(value = "X-Admin-User", required = false, defaultValue = "admin") String actor
    ) {
        String effectiveActor = currentUserHelper.getCurrentUser().map(User::getUsername).orElse(actor);
        UserDto dto = rbacService.revokeRoleFromUser(id, roleName, effectiveActor);
        return ResponseEntity.ok(ApiResponse.ok("Rol muvaffaqiyatli olib tashlandi", dto));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN') or hasAuthority('users.disable')")
    @Operation(summary = "Foydalanuvchi hisobini faollashtirish yoki to'xtatib qo'yish (Suspension/Activation)")
    public ResponseEntity<ApiResponse<UserDto>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request,
            @RequestHeader(value = "X-Admin-User", required = false, defaultValue = "admin") String actor
    ) {
        String effectiveActor = currentUserHelper.getCurrentUser().map(User::getUsername).orElse(actor);
        UserDto dto = rbacService.updateUserStatus(id, request.isEnabled(), request.getReason(), effectiveActor);
        return ResponseEntity.ok(ApiResponse.ok("Foydalanuvchi hisobi holati yangilandi", dto));
    }
}
