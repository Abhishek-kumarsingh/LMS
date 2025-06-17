package com.lms.service;

import com.lms.entity.Certificate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfCertificateGeneratorService {

    private final TemplateEngine templateEngine;

    @Value("${app.certificate.storage-path:./certificates}")
    private String certificateStoragePath;

    @Value("${app.certificate.template:certificate-template}")
    private String certificateTemplate;

    public String generateCertificate(Certificate certificate, String fileName) throws IOException {
        // Ensure storage directory exists
        Path storagePath = Paths.get(certificateStoragePath);
        if (!Files.exists(storagePath)) {
            Files.createDirectories(storagePath);
        }

        // Prepare template context
        Context context = new Context(Locale.ENGLISH);
        context.setVariable("certificate", certificate);
        context.setVariable("studentName", certificate.getUser().getFullName());
        context.setVariable("courseName", certificate.getCourse().getTitle());
        context.setVariable("instructorName", certificate.getCourse().getInstructor().getFullName());
        context.setVariable("certificateNumber", certificate.getCertificateNumber());
        context.setVariable("issueDate", certificate.getIssuedAt().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")));
        context.setVariable("completionDate", certificate.getEnrollment().getCompletedAt().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")));
        context.setVariable("courseDuration", formatDuration(certificate.getCourse().getDurationMinutes()));

        // Generate HTML from template
        String htmlContent = templateEngine.process(certificateTemplate, context);

        // Convert HTML to PDF
        String filePath = Paths.get(certificateStoragePath, fileName).toString();
        generatePdfFromHtml(htmlContent, filePath);

        log.info("Certificate PDF generated: {}", filePath);
        return filePath;
    }

    private void generatePdfFromHtml(String htmlContent, String outputPath) throws IOException {
        try (FileOutputStream outputStream = new FileOutputStream(outputPath)) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(outputStream);
        } catch (Exception e) {
            log.error("Failed to generate PDF from HTML", e);
            throw new IOException("Failed to generate PDF", e);
        }
    }

    private String formatDuration(Integer durationMinutes) {
        if (durationMinutes == null || durationMinutes == 0) {
            return "N/A";
        }

        int hours = durationMinutes / 60;
        int minutes = durationMinutes % 60;

        if (hours > 0 && minutes > 0) {
            return String.format("%d hours %d minutes", hours, minutes);
        } else if (hours > 0) {
            return String.format("%d hours", hours);
        } else {
            return String.format("%d minutes", minutes);
        }
    }

    public boolean deleteCertificateFile(String filePath) {
        try {
            File file = new File(filePath);
            if (file.exists()) {
                boolean deleted = file.delete();
                if (deleted) {
                    log.info("Certificate file deleted: {}", filePath);
                } else {
                    log.warn("Failed to delete certificate file: {}", filePath);
                }
                return deleted;
            }
            return true;
        } catch (Exception e) {
            log.error("Error deleting certificate file: {}", filePath, e);
            return false;
        }
    }

    public boolean certificateFileExists(String filePath) {
        try {
            File file = new File(filePath);
            return file.exists() && file.isFile();
        } catch (Exception e) {
            log.error("Error checking certificate file existence: {}", filePath, e);
            return false;
        }
    }
}
