package uz.axm.nexus.access.presentation;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import uz.axm.nexus.access.application.AssignRolesRequest;
import uz.axm.nexus.access.application.UpdateUserStatusRequest;
import uz.axm.nexus.access.domain.Role;
import uz.axm.nexus.access.infrastructure.RoleRepository;
import uz.axm.nexus.users.domain.User;
import uz.axm.nexus.users.infrastructure.UserRepository;

import java.util.HashSet;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser(username = "admin", roles = {"SUPER_ADMIN", "ADMIN"})
class UserManagementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Test
    @DisplayName("Foydalanuvchiga bir vaqtning o'zida bir nechta rollarni biriktirish (Multi-Role)")
    void shouldAssignMultipleRolesToUser() throws Exception {
        User testUser = userRepository.save(User.builder()
                .username("multirole_user")
                .password("hashpass")
                .fullName("Multi Role Test User")
                .email("multirole@test.uz")
                .role("ROLE_STUDENT")
                .enabled(true)
                .build());

        AssignRolesRequest request = AssignRolesRequest.builder()
                .roles(Set.of("MENTOR", "CONTENT_MANAGER"))
                .build();

        mockMvc.perform(put("/api/users/" + testUser.getId() + "/roles")
                        .header("X-Admin-User", "admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.roles", hasItems("MENTOR", "CONTENT_MANAGER")))
                .andExpect(jsonPath("$.data.effectivePermissions", hasItems("materials.manage", "attendance.record")));
    }

    @Test
    @DisplayName("Oxirgi faol Super Administrator rolini olib tashlash taqiqlanishi kerak")
    void shouldPreventRemovingLastActiveSuperAdminRole() throws Exception {
        User admin = userRepository.findByUsername("admin").orElseThrow();

        // Attempt to remove SUPER_ADMIN by assigning only STUDENT
        AssignRolesRequest request = AssignRolesRequest.builder()
                .roles(Set.of("STUDENT"))
                .build();

        mockMvc.perform(put("/api/users/" + admin.getId() + "/roles")
                        .header("X-Admin-User", "admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("oxirgi faol Super Administrator")));
    }

    @Test
    @DisplayName("Oxirgi faol Super Administrator hisobini to'xtatish (suspend) taqiqlanishi kerak")
    void shouldPreventSuspendingLastActiveSuperAdmin() throws Exception {
        User admin = userRepository.findByUsername("admin").orElseThrow();

        UpdateUserStatusRequest request = UpdateUserStatusRequest.builder()
                .enabled(false)
                .reason("Test suspend")
                .build();

        mockMvc.perform(patch("/api/users/" + admin.getId() + "/status")
                        .header("X-Admin-User", "admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("oxirgi faol Super Administrator")));
    }

    @Test
    @DisplayName("Oddiy foydalanuvchi hisobini faolsizlantirish va faollashtirish ishlashi kerak")
    void shouldToggleUserAccountStatus() throws Exception {
        User user = userRepository.save(User.builder()
                .username("toggle_user")
                .password("hashpass")
                .fullName("Toggle Test User")
                .email("toggle@test.uz")
                .role("ROLE_STUDENT")
                .enabled(true)
                .build());

        UpdateUserStatusRequest suspendReq = UpdateUserStatusRequest.builder()
                .enabled(false)
                .reason("Qoidabuzarlik")
                .build();

        mockMvc.perform(patch("/api/users/" + user.getId() + "/status")
                        .header("X-Admin-User", "admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(suspendReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.enabled").value(false));

        UpdateUserStatusRequest activateReq = UpdateUserStatusRequest.builder()
                .enabled(true)
                .build();

        mockMvc.perform(patch("/api/users/" + user.getId() + "/status")
                        .header("X-Admin-User", "admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(activateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.enabled").value(true));
    }

    @Test
    @DisplayName("Foydalanuvchilar katalogini qidirish va filtrlash")
    void shouldSearchAndFilterUsers() throws Exception {
        mockMvc.perform(get("/api/users?query=admin&page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.content[0].username").value("admin"));
    }

    @Test
    @DisplayName("Oddiy talaba roli foydalanuvchilar rollarini o'zgartira olmasligi (403 Forbidden) kerak")
    @WithMockUser(username = "student_user", roles = {"STUDENT"})
    void shouldDenyAssignRolesForStudent() throws Exception {
        AssignRolesRequest request = AssignRolesRequest.builder()
                .roles(Set.of("SUPER_ADMIN"))
                .build();

        mockMvc.perform(put("/api/users/1/roles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_ACCESS_DENIED"));
    }
}
