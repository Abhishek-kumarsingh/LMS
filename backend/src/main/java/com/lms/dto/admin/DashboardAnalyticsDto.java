package com.lms.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardAnalyticsDto {
    
    private LocalDateTime generatedAt;
    private OverviewStats overview;
    private UserStats users;
    private CourseStats courses;
    private EnrollmentStats enrollments;
    private RevenueStats revenue;
    private List<TrendData> trends;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverviewStats {
        private long totalUsers;
        private long totalCourses;
        private long totalEnrollments;
        private long totalCertificates;
        private long totalReviews;
        private long totalComments;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStats {
        private long totalStudents;
        private long totalInstructors;
        private long totalAdmins;
        private long activeUsers;
        private long inactiveUsers;
        private long pendingInstructors;
        private long newUsersLast30Days;
        private List<MonthlyData> monthlyRegistrations;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseStats {
        private long publishedCourses;
        private long unpublishedCourses;
        private long pendingCourses;
        private long newCoursesLast30Days;
        private double averageRating;
        private List<CategoryData> coursesByCategory;
        private List<CourseData> topRatedCourses;
        private List<CourseData> mostEnrolledCourses;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnrollmentStats {
        private long totalEnrollments;
        private long activeEnrollments;
        private long completedEnrollments;
        private long newEnrollmentsLast30Days;
        private double completionRate;
        private double averageProgress;
        private List<MonthlyData> monthlyEnrollments;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueStats {
        private BigDecimal totalRevenue;
        private BigDecimal monthlyRevenue;
        private BigDecimal platformRevenue;
        private BigDecimal instructorRevenue;
        private List<MonthlyData> monthlyRevenueTrends;
        private List<InstructorEarningsData> topEarningInstructors;
        private List<CourseEarningsData> topEarningCourses;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendData {
        private String period;
        private String metric;
        private Object value;
        private double changePercentage;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyData {
        private int year;
        private int month;
        private String monthName;
        private long count;
        private BigDecimal amount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryData {
        private String categoryId;
        private String categoryName;
        private long courseCount;
        private long enrollmentCount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseData {
        private String courseId;
        private String title;
        private String instructorName;
        private long enrollmentCount;
        private double averageRating;
        private int totalRatings;
        private BigDecimal price;
        private LocalDateTime createdAt;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InstructorEarningsData {
        private String instructorId;
        private String instructorName;
        private String instructorEmail;
        private BigDecimal totalEarnings;
        private long courseCount;
        private long enrollmentCount;
        private double averageRating;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseEarningsData {
        private String courseId;
        private String title;
        private String instructorName;
        private BigDecimal totalEarnings;
        private long enrollmentCount;
        private double averageRating;
        private BigDecimal price;
    }
}
