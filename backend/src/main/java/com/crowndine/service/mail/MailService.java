package com.crowndine.service.mail;

public interface MailService {
    void sendConfirmLink(String emailTo, String template, String endPointConfirmUser, String verifyCode);
}
