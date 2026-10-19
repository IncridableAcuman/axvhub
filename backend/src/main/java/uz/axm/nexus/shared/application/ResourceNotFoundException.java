package uz.axm.nexus.shared.application;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resourceName, Object identifier) {
        super(String.format("%s topilmadi: %s", resourceName, identifier));
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
