package com.lms.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailTemplateService {

    @Value("${cors.allowed-origins}")
    private String frontendUrl;

    private String getBaseUrl() {
        return frontendUrl.split(",")[0];
    }

    public String generateWelcomeEmail(Map<String, Object> data) {
        String firstName = (String) data.get("firstName");
        String verificationToken = (String) data.get("verificationToken");
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Welcome to Modern LMS</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Modern LMS!</h1>
                        <p>Your journey to knowledge starts here</p>
                    </div>
                    <div class="content">
                        <h2>Hi %s,</h2>
                        <p>Welcome to Modern LMS! We're thrilled to have you join our learning community where knowledge meets innovation.</p>
                        
                        <p><strong>What you can do with Modern LMS:</strong></p>
                        <ul>
                            <li>📚 Access thousands of high-quality courses</li>
                            <li>🎓 Earn certificates upon completion</li>
                            <li>👥 Connect with instructors and fellow learners</li>
                            <li>📊 Track your learning progress</li>
                            <li>💡 Learn at your own pace</li>
                        </ul>
                        
                        <p>To get started, please verify your email address by clicking the button below:</p>
                        
                        <div style="text-align: center;">
                            <a href="%s/verify-email?token=%s" class="button">Verify Email Address</a>
                        </div>
                        
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #667eea;">%s/verify-email?token=%s</p>
                        
                        <p>This verification link will expire in 24 hours for security reasons.</p>
                        
                        <p>Happy learning!</p>
                        <p><strong>The Modern LMS Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Modern LMS. All rights reserved.</p>
                        <p>If you didn't create this account, please ignore this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """, firstName, getBaseUrl(), verificationToken, getBaseUrl(), verificationToken);
    }

    public String generateEnrollmentConfirmationEmail(Map<String, Object> data) {
        String studentName = (String) data.get("studentName");
        String courseName = (String) data.get("courseName");
        String instructorName = (String) data.get("instructorName");
        Integer courseDuration = (Integer) data.get("courseDuration");
        String courseId = (String) data.get("courseId");
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Course Enrollment Confirmation</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #4CAF50 0%%, #45a049 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .course-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50; }
                    .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Enrollment Confirmed!</h1>
                        <p>You're all set to start learning</p>
                    </div>
                    <div class="content">
                        <h2>Hi %s,</h2>
                        <p>Congratulations! You have successfully enrolled in your new course. We're excited to be part of your learning journey.</p>
                        
                        <div class="course-info">
                            <h3>📚 Course Details</h3>
                            <p><strong>Course:</strong> %s</p>
                            <p><strong>Instructor:</strong> %s</p>
                            <p><strong>Duration:</strong> %d hours</p>
                            <p><strong>Access:</strong> Lifetime access</p>
                        </div>
                        
                        <p><strong>What's next?</strong></p>
                        <ul>
                            <li>Start with the first lesson at your own pace</li>
                            <li>Join course discussions and connect with other students</li>
                            <li>Complete assignments and quizzes to track your progress</li>
                            <li>Earn your certificate upon course completion</li>
                        </ul>
                        
                        <div style="text-align: center;">
                            <a href="%s/courses/%s" class="button">Start Learning Now</a>
                        </div>
                        
                        <p>Need help? Our support team is here to assist you. Simply reply to this email or visit our help center.</p>
                        
                        <p>Happy learning!</p>
                        <p><strong>The Modern LMS Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Modern LMS. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, studentName, courseName, instructorName, courseDuration, getBaseUrl(), courseId);
    }

    public String generatePasswordResetEmail(Map<String, Object> data) {
        String firstName = (String) data.get("firstName");
        String resetToken = (String) data.get("resetToken");
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Password Reset Request</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ff6b6b 0%%, #ee5a24 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Password Reset</h1>
                        <p>Secure your account</p>
                    </div>
                    <div class="content">
                        <h2>Hi %s,</h2>
                        <p>We received a request to reset your password for your Modern LMS account. If you made this request, click the button below to reset your password.</p>
                        
                        <div style="text-align: center;">
                            <a href="%s/reset-password?token=%s" class="button">Reset Password</a>
                        </div>
                        
                        <div class="warning">
                            <p><strong>⚠️ Security Notice:</strong></p>
                            <ul>
                                <li>This link will expire in 1 hour for security reasons</li>
                                <li>If you didn't request this reset, please ignore this email</li>
                                <li>Your password will remain unchanged until you create a new one</li>
                            </ul>
                        </div>
                        
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #ff6b6b;">%s/reset-password?token=%s</p>
                        
                        <p>For security reasons, we recommend:</p>
                        <ul>
                            <li>Using a strong, unique password</li>
                            <li>Not sharing your password with anyone</li>
                            <li>Logging out from shared devices</li>
                        </ul>
                        
                        <p>If you have any concerns about your account security, please contact our support team immediately.</p>
                        
                        <p><strong>The Modern LMS Security Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Modern LMS. All rights reserved.</p>
                        <p>This is an automated security email. Please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
            """, firstName, getBaseUrl(), resetToken, getBaseUrl(), resetToken);
    }

    public String generateCertificateReadyEmail(Map<String, Object> data) {
        String studentName = (String) data.get("studentName");
        String courseName = (String) data.get("courseName");
        String certificateNumber = (String) data.get("certificateNumber");
        String instructorName = (String) data.get("instructorName");
        String completionDate = (String) data.get("completionDate");
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Certificate Ready for Download</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f39c12 0%%, #e67e22 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .certificate-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f39c12; }
                    .button { display: inline-block; background: #f39c12; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏆 Congratulations!</h1>
                        <p>Your certificate is ready</p>
                    </div>
                    <div class="content">
                        <h2>Hi %s,</h2>
                        <p>🎉 <strong>Congratulations on completing your course!</strong> We're proud of your dedication and hard work.</p>
                        
                        <div class="certificate-info">
                            <h3>📜 Certificate Details</h3>
                            <p><strong>Course:</strong> %s</p>
                            <p><strong>Instructor:</strong> %s</p>
                            <p><strong>Completion Date:</strong> %s</p>
                            <p><strong>Certificate Number:</strong> %s</p>
                        </div>
                        
                        <p>Your official certificate is now ready for download. This certificate verifies that you have successfully completed all course requirements and demonstrates your new skills and knowledge.</p>
                        
                        <div style="text-align: center;">
                            <a href="%s/dashboard/certificates" class="button">Download Certificate</a>
                        </div>
                        
                        <p><strong>Ways to use your certificate:</strong></p>
                        <ul>
                            <li>📄 Add it to your resume or CV</li>
                            <li>💼 Share it on LinkedIn and other professional networks</li>
                            <li>🎯 Use it to demonstrate skills to employers</li>
                            <li>📚 Include it in your professional portfolio</li>
                        </ul>
                        
                        <p>Keep learning! Check out our other courses to continue expanding your skills.</p>
                        
                        <p>Once again, congratulations on this achievement!</p>
                        <p><strong>The Modern LMS Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Modern LMS. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, studentName, courseName, instructorName, completionDate, certificateNumber, getBaseUrl());
    }

    public String generateInstructorApprovedEmail(Map<String, Object> data) {
        String instructorName = (String) data.get("instructorName");
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Instructor Application Approved</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #27ae60 0%%, #2ecc71 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome, Instructor!</h1>
                        <p>Your application has been approved</p>
                    </div>
                    <div class="content">
                        <h2>Hi %s,</h2>
                        <p>Excellent news! Your instructor application has been approved. Welcome to the Modern LMS instructor community!</p>
                        
                        <p><strong>As an approved instructor, you can now:</strong></p>
                        <ul>
                            <li>📚 Create and publish courses</li>
                            <li>👥 Manage student enrollments</li>
                            <li>💬 Interact with students through discussions</li>
                            <li>📊 Track course performance and analytics</li>
                            <li>💰 Earn revenue from your courses</li>
                        </ul>
                        
                        <div style="text-align: center;">
                            <a href="%s/instructor/dashboard" class="button">Access Instructor Dashboard</a>
                        </div>
                        
                        <p>We're excited to see the knowledge and expertise you'll share with our learning community. If you need any help getting started, our instructor support team is here to assist you.</p>
                        
                        <p>Welcome aboard!</p>
                        <p><strong>The Modern LMS Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Modern LMS. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, instructorName, getBaseUrl());
    }
}
