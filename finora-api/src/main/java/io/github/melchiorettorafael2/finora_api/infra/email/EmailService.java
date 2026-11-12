package io.github.melchiorettorafael2.finora_api.infra.email;

import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import java.nio.charset.StandardCharsets;

/**
 * Envio de e-mails do sistema (por enquanto só o link de redefinição de senha).
 * O SMTP vem das variáveis MAIL_HOST, MAIL_PORT, MAIL_USERNAME e MAIL_PASSWORD (ver application.yml).
 * Sem MAIL_HOST (desenvolvimento), o e-mail não é enviado: o link aparece no log da API.
 * Roda em segundo plano (@Async): a resposta da API não espera o SMTP e leva o mesmo tempo
 * exista ou não a conta.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final String host;
    private final String remetente;

    public EmailService(ObjectProvider<JavaMailSender> mailSender,
                        @Value("${spring.mail.host:}") String host,
                        @Value("${app.mail.remetente}") String remetente) {
        this.mailSender = mailSender;
        this.host = host;
        this.remetente = remetente;
    }

    @Async
    public void enviarRedefinicaoSenha(String para, String nome, String link, long minutosValidade) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (host.isBlank() || sender == null) {
            log.warn("SMTP não configurado (MAIL_HOST vazio). Link de redefinição para {}: {}", para, link);
            return;
        }

        try {
            var mensagem = sender.createMimeMessage();
            var helper = new MimeMessageHelper(mensagem, true, StandardCharsets.UTF_8.name());
            helper.setFrom(remetente);
            helper.setTo(para);
            helper.setSubject("Redefinir sua senha do Finora");
            helper.setText(textoSimples(nome, link, minutosValidade), html(nome, link, minutosValidade));
            sender.send(mensagem);
        } catch (MessagingException | MailException e) {
            // Não derruba nada: quem pediu vê a mesma resposta e pode pedir de novo
            log.error("Falha ao enviar o e-mail de redefinição para {}: {}", para, e.getMessage());
        }
    }

    private String textoSimples(String nome, String link, long minutos) {
        return """
                Olá, %s.

                Recebemos um pedido para redefinir a senha da sua conta no Finora.
                Para criar uma nova senha, abra o link abaixo (vale por %d minutos e só pode ser usado uma vez):

                %s

                Se não foi você, pode ignorar este e-mail. Sua senha continua a mesma.
                """.formatted(nome, minutos, link);
    }

    private String html(String nome, String link, long minutos) {
        String nomeSeguro = HtmlUtils.htmlEscape(nome);
        String linkSeguro = HtmlUtils.htmlEscape(link);
        return """
                <!doctype html>
                <html lang="pt-BR">
                <body style="margin:0;padding:24px;background:#eef1f5;font-family:Segoe UI,Arial,sans-serif;color:#1c2738">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
                    <tr><td align="center">
                      <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;overflow:hidden">
                        <tr><td style="background:#0e1622;padding:20px 28px;color:#f4f8ff;font-size:20px;font-weight:700;letter-spacing:.5px">
                          FINOR<span style="color:#34d3a3">A</span>
                        </td></tr>
                        <tr><td style="padding:28px">
                          <p style="margin:0 0 12px;font-size:16px">Olá, <strong>%s</strong>.</p>
                          <p style="margin:0 0 20px;font-size:14px;line-height:1.5">
                            Recebemos um pedido para redefinir a senha da sua conta. Clique no botão para criar uma nova.
                          </p>
                          <p style="margin:0 0 20px">
                            <a href="%s" style="display:inline-block;padding:12px 22px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">
                              Redefinir senha
                            </a>
                          </p>
                          <p style="margin:0 0 6px;font-size:12.5px;color:#5b6982">
                            O link vale por %d minutos e só pode ser usado uma vez.
                          </p>
                          <p style="margin:0;font-size:12.5px;color:#5b6982">
                            Se não foi você, pode ignorar este e-mail. Sua senha continua a mesma.
                          </p>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(nomeSeguro, linkSeguro, minutos);
    }
}
