package com.crowndine.service.mail;

import java.util.Map;

public interface MailService {
    void sendConfirmLink(String emailTo, String template, String endPointConfirmUser, String verifyCode);

    void sendResetPasswordLink(String emailTo, String resetPasswordEndpoint, String resetPasswordToken);

    void sendReservationSuccessEmail(String emailTo, Map<String, Object> reservationDetails);
    
    void sendOtpEmail(String emailTo, String otp);
}
