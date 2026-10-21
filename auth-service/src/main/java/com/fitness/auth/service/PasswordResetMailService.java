package com.fitness.auth.service;

import com.fitness.auth.user.AppUser;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class PasswordResetMailService {
  private final JavaMailSender mailSender;
  private final String mailHost;
  private final String mailFrom;

  public PasswordResetMailService(
      ObjectProvider<JavaMailSender> mailSenderProvider,
      @Value("${spring.mail.host:}") String mailHost,
      @Value("${app.mail.from:}") String mailFrom) {
    this.mailSender = mailSenderProvider.getIfAvailable();
    this.mailHost = mailHost == null ? "" : mailHost.trim();
    this.mailFrom = mailFrom == null ? "" : mailFrom.trim();
  }

  public void sendTemporaryPassword(AppUser user, String temporaryPassword) {
    if (mailSender == null || mailHost.isBlank() || mailFrom.isBlank()) {
      throw AuthException.badRequest(
          "Emailul nu este configurat. Seteaza MAIL_HOST, MAIL_USERNAME, MAIL_PASSWORD si MAIL_FROM.");
    }

    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(mailFrom);
    message.setTo(user.getEmail());
    message.setSubject("Parola temporara TET-FIT");
    message.setText(
        """
        Salut, %s,

        Ai cerut resetarea parolei pentru contul tau TET-FIT.

        Parola temporara este:
        %s

        Intra in aplicatie cu username-ul tau si aceasta parola. Dupa autentificare, iti recomandam sa o schimbi.

        Daca nu ai cerut resetarea parolei, contacteaza administratorul platformei.
        """
            .formatted(user.getFullName(), temporaryPassword));

    try {
      mailSender.send(message);
    } catch (MailException exception) {
      throw AuthException.badRequest("Emailul nu a putut fi trimis. Verifica setarile SMTP.");
    }
  }
}
