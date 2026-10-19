package uz.axm.nexus.shared.domain;

import java.time.Instant;

public interface DomainEvent {
    Instant occurredOn();
}
