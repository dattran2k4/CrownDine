package com.crowndine.core.service.impl.mail;

import com.crowndine.core.service.mail.MailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MAIL-SERVICE")
public class MailServiceImpl implements MailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${spring.mail.from}")
    private String emailFrom;

    @Override
    public void sendConfirmLink(String emailTo, String template, String endPointConfirmUser, String verifyCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED,
                    StandardCharsets.UTF_8.name());
            Context context = new Context();

            String confirmLink = String.format("%s?verifyCode=%s", endPointConfirmUser,
                    URLEncoder.encode(verifyCode, StandardCharsets.UTF_8));

            Map<String, Object> properties = new HashMap<>();
            properties.put("confirmLink", confirmLink);
            properties.put("verifyCode", verifyCode);
            context.setVariables(properties);

            helper.setFrom(emailFrom, "Đạt Trần");
            helper.setTo(emailTo);
            helper.setSubject("Xác nhận tài khoản");
            String html = templateEngine.process(template, context);
            helper.setText(html, true);

            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send confirm link email to {}: {}", emailTo, e.getMessage(), e);
        }
    }

    @Override
    public void sendResetPasswordLink(String emailTo, String resetPasswordEndpoint, String resetPasswordToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED,
                    StandardCharsets.UTF_8.name());
            Context context = new Context();

            String resetPasswordLink = String.format("%s?token=%s", resetPasswordEndpoint, URLEncoder.encode(resetPasswordToken, StandardCharsets.UTF_8));

            Map<String, Object> properties = new HashMap<>();
            properties.put("resetPasswordLink", resetPasswordLink);
            properties.put("resetPasswordToken", resetPasswordToken);
            context.setVariables(properties);

            helper.setFrom(emailFrom, "CrownDine Restaurant");
            helper.setTo(emailTo);
            helper.setSubject("Đặt lại mật khẩu");
            String html = templateEngine.process("email-reset-password.html", context);
            helper.setText(html, true);

            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send reset password email to {}: {}", emailTo, e.getMessage(), e);
        }
    }

    @Override
    public void sendReservationSuccessEmail(String emailTo, Map<String, Object> reservationDetails) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED,
                    java.nio.charset.StandardCharsets.UTF_8.name());
            Context context = new Context();
            context.setVariables(reservationDetails);

            helper.setFrom(emailFrom, "CrownDine Restaurant");
            helper.setTo(emailTo);
            helper.setSubject("Xác nhận đặt bàn thành công - CrownDine");
            String html = templateEngine.process("reservation-confirmed", context);
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Reservation success email sent to {}", emailTo);
        } catch (Exception e) {
            log.error("Failed to send reservation success email to {}: {}", emailTo, e.getMessage(), e);
        }
    }
    @Override
    public void sendOtpEmail(String emailTo, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED,
                    StandardCharsets.UTF_8.name());
            Context context = new Context();
            context.setVariable("otp", otp);

            helper.setFrom(emailFrom, "CrownDine Restaurant");
            helper.setTo(emailTo);
            helper.setSubject("Mã xác thực OTP - CrownDine");
            
            String html = templateEngine.process("email-otp.html", context);
            helper.setText(html, true);

            mailSender.send(message);
            log.info("OTP email sent successfully to {}", emailTo);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", emailTo, e.getMessage());
        }
    }
}
