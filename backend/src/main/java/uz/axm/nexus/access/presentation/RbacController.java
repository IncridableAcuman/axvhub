package uz.axm.nexus.access.presentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uz.axm.nexus.access.application.PermissionDto;
import uz.axm.nexus.access.application.RbacService;
import uz.axm.nexus.access.application.RoleDto;
import uz.axm.nexus.shared.application.ApiResponse;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Tag(name = "Roles & Permissions Management", description = "Tizim rollari va ruxsatlarini konfiguratsiya qilish")
public class RbacController {

    private final RbacService rbacService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'PROGRAM_ADMIN', 'OBSERVER') or hasAuthority('roles.read')")
    @Operation(summary = "Barcha rollar va ularga biriktirilgan ruxsatlar ro'yxatini olish")
    public ResponseEntity<ApiResponse<List<RoleDto>>> getAllRoles() {
        List<RoleDto> roles = rbacService.getAllRoles();
        return ResponseEntity.ok(ApiResponse.ok("Rollar ro'yxati olindi", roles));
    }

    @GetMapping("/permissions")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'PROGRAM_ADMIN', 'OBSERVER') or hasAuthority('roles.read')")
    @Operation(summary = "Tizimdagi barcha mavjud ruxsatlar (permissions) katalogini olish")
    public ResponseEntity<ApiResponse<List<PermissionDto>>> getAllPermissions() {
        List<PermissionDto> permissions = rbacService.getAllPermissions();
        return ResponseEntity.ok(ApiResponse.ok("Ruxsatlar ro'yxati olindi", permissions));
    }

    @PutMapping("/{id}/permissions")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN') or hasAuthority('roles.manage')")
    @Operation(summary = "Rolga tegishli ruxsatlarni dinamik konfiguratsiya qilish (kod o'zgarishisiz)")
    public ResponseEntity<ApiResponse<RoleDto>> updateRolePermissions(
            @PathVariable Long id,
            @RequestBody Set<String> permissionNames
    ) {
        RoleDto roleDto = rbacService.updateRolePermissions(id, permissionNames);
        return ResponseEntity.ok(ApiResponse.ok("Rol ruxsatlari muvaffaqiyatli yangilandi", roleDto));
    }
}
