package uz.axm.nexus.access.application;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.axm.nexus.shared.application.PageResponse;
import uz.axm.nexus.shared.application.ResourceNotFoundException;
import uz.axm.nexus.users.domain.User;
import uz.axm.nexus.users.infrastructure.UserRepository;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserRepository userRepository;
    private final RbacService rbacService;

    @Transactional(readOnly = true)
    public PageResponse<UserDto> searchUsers(String query, String role, Boolean enabled, int page, int size, String sortBy, String sortDir) {
        List<User> allUsers = userRepository.findAll();

        // 1. Filter by query
        if (query != null && !query.trim().isBlank()) {
            String q = query.trim().toLowerCase();
            allUsers = allUsers.stream()
                    .filter(u -> (u.getFullName() != null && u.getFullName().toLowerCase().contains(q)) ||
                                 (u.getEmail() != null && u.getEmail().toLowerCase().contains(q)) ||
                                 (u.getUsername() != null && u.getUsername().toLowerCase().contains(q)) ||
                                 (u.getPhone() != null && u.getPhone().contains(q)))
                    .collect(Collectors.toList());
        }

        // 2. Filter by role
        if (role != null && !role.trim().isBlank() && !role.equalsIgnoreCase("ALL")) {
            String target = rbacService.normalizeRoleName(role);
            allUsers = allUsers.stream()
                    .filter(u -> {
                        if (rbacService.normalizeRoleName(u.getRole()).equalsIgnoreCase(target)) return true;
                        return u.getRoles() != null && u.getRoles().stream()
                                .anyMatch(r -> rbacService.normalizeRoleName(r.getName()).equalsIgnoreCase(target));
                    })
                    .collect(Collectors.toList());
        }

        // 3. Filter by enabled status
        if (enabled != null) {
            allUsers = allUsers.stream()
                    .filter(u -> u.isEnabled() == enabled)
                    .collect(Collectors.toList());
        }

        // 4. Sort
        Comparator<User> comparator = Comparator.comparing(User::getId);
        if ("fullName".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(u -> u.getFullName() != null ? u.getFullName() : "");
        } else if ("email".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(u -> u.getEmail() != null ? u.getEmail() : "");
        } else if ("createdAt".equalsIgnoreCase(sortBy)) {
            comparator = Comparator.comparing(u -> u.getCreatedAt() != null ? u.getCreatedAt() : java.time.LocalDateTime.MIN);
        }

        if ("desc".equalsIgnoreCase(sortDir)) {
            comparator = comparator.reversed();
        }
        allUsers.sort(comparator);

        // 5. Pagination
        int totalElements = allUsers.size();
        int fromIndex = Math.min(page * size, totalElements);
        int toIndex = Math.min(fromIndex + size, totalElements);

        List<UserDto> dtos = allUsers.subList(fromIndex, toIndex).stream()
                .map(rbacService::toUserDto)
                .collect(Collectors.toList());

        int totalPages = size > 0 ? (int) Math.ceil((double) totalElements / size) : 1;

        return PageResponse.<UserDto>builder()
                .content(dtos)
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .last(page >= totalPages - 1)
                .build();

    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Foydalanuvchi topilmadi: #" + id));
        return rbacService.toUserDto(user);
    }
}
