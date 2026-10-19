package uz.axm.nexus.notifications.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationEvent implements Serializable {
    private String recipientEmail;
    private String recipientName;
    private String verificationToken;
    private String verificationCode;
    private String confirmationUrl;
    private int expirationHours;
}
