package uz.axm.nexus.shared.application;

import lombok.Getter;

@Getter
public class RateLimitException extends BusinessException {

    private final long retryAfterSeconds;

    public RateLimitException(String message, long retryAfterSeconds) {
        super(message);
        this.retryAfterSeconds = retryAfterSeconds;
    }
}
