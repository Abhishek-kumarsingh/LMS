import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Avatar,
  Chip,
  ProgressBar,
  Surface,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { fetchDashboardData } from '../store/slices/dashboardSlice';
import { fetchUpcomingEvents } from '../store/slices/calendarSlice';
import { fetchRecentNotifications } from '../store/slices/notificationSlice';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { QuickActionCard } from '../components/dashboard/QuickActionCard';
import { UpcomingEventCard } from '../components/dashboard/UpcomingEventCard';
import { RecentActivityCard } from '../components/dashboard/RecentActivityCard';
import { ProgressCard } from '../components/dashboard/ProgressCard';
import { AnnouncementCard } from '../components/dashboard/AnnouncementCard';
import { OfflineIndicator } from '../components/common/OfflineIndicator';
import { theme } from '../theme';
import { DashboardStackNavigationProp } from '../types/navigation';

const { width } = Dimensions.get('window');

interface DashboardScreenProps {
  navigation: DashboardStackNavigationProp;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { isOnline } = useAppSelector(state => state.app);
  const {
    data: dashboardData,
    loading,
    error,
    lastUpdated,
  } = useAppSelector(state => state.dashboard);
  const { upcomingEvents } = useAppSelector(state => state.calendar);
  const { recentNotifications } = useAppSelector(state => state.notifications);

  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
      animateIn();
    }, [])
  );

  useEffect(() => {
    if (isOnline) {
      loadDashboardData();
    }
  }, [isOnline]);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchDashboardData()).unwrap(),
        dispatch(fetchUpcomingEvents()).unwrap(),
        dispatch(fetchRecentNotifications()).unwrap(),
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const animateIn = () => {
    fadeAnim.value = withSpring(1, { damping: 15 });
    slideAnim.value = withSpring(0, { damping: 15 });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      title: 'My Courses',
      icon: 'book-open-variant',
      color: theme.colors.primary,
      onPress: () => navigation.navigate('CoursesTab'),
    },
    {
      title: 'Assignments',
      icon: 'clipboard-text',
      color: '#FF6B6B',
      badge: dashboardData?.pendingAssignments || 0,
      onPress: () => navigation.navigate('AssignmentsTab'),
    },
    {
      title: 'Calendar',
      icon: 'calendar',
      color: '#4ECDC4',
      onPress: () => navigation.navigate('Calendar'),
    },
    {
      title: 'Messages',
      icon: 'message-text',
      color: '#45B7D1',
      badge: dashboardData?.unreadMessages || 0,
      onPress: () => navigation.navigate('MessagesTab'),
    },
  ];

  if (loading && !dashboardData) {
    return <LoadingSpinner />;
  }

  if (error && !dashboardData) {
    return (
      <ErrorMessage
        message="Failed to load dashboard"
        onRetry={loadDashboardData}
      />
    );
  }

  return (
    <View style={styles.container}>
      {!isOnline && <OfflineIndicator />}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, animatedStyle]}>
          {/* Header */}
          <Surface style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.userInfo}>
                <Avatar.Text
                  size={50}
                  label={user?.firstName?.[0] || 'U'}
                  style={styles.avatar}
                />
                <View style={styles.greetingContainer}>
                  <Title style={styles.greeting}>
                    {getGreeting()}, {user?.firstName}!
                  </Title>
                  <Paragraph style={styles.subtitle}>
                    Ready to continue learning?
                  </Paragraph>
                </View>
              </View>
              
              <Button
                mode="outlined"
                icon="bell"
                onPress={() => navigation.navigate('Notifications')}
                style={styles.notificationButton}
              >
                {recentNotifications?.length || 0}
              </Button>
            </View>
          </Surface>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Title style={styles.sectionTitle}>Quick Actions</Title>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <Animated.View
                  key={action.title}
                  style={[
                    useAnimatedStyle(() => ({
                      opacity: withDelay(index * 100, withSpring(1)),
                      transform: [
                        {
                          translateY: withDelay(
                            index * 100,
                            withSpring(0, { damping: 15 })
                          ),
                        },
                      ],
                    })),
                  ]}
                >
                  <QuickActionCard {...action} />
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Progress Overview */}
          {dashboardData?.courseProgress && (
            <View style={styles.section}>
              <Title style={styles.sectionTitle}>Learning Progress</Title>
              <ProgressCard
                courses={dashboardData.courseProgress}
                onViewAll={() => navigation.navigate('CoursesTab')}
              />
            </View>
          )}

          {/* Upcoming Events */}
          {upcomingEvents && upcomingEvents.length > 0 && (
            <View style={styles.section}>
              <Title style={styles.sectionTitle}>Upcoming Events</Title>
              {upcomingEvents.slice(0, 3).map((event, index) => (
                <Animated.View
                  key={event.id}
                  style={[
                    useAnimatedStyle(() => ({
                      opacity: withDelay((index + 4) * 100, withSpring(1)),
                      transform: [
                        {
                          translateY: withDelay(
                            (index + 4) * 100,
                            withSpring(0, { damping: 15 })
                          ),
                        },
                      ],
                    })),
                  ]}
                >
                  <UpcomingEventCard
                    event={event}
                    onPress={() => navigation.navigate('Calendar')}
                  />
                </Animated.View>
              ))}
              
              {upcomingEvents.length > 3 && (
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('Calendar')}
                  style={styles.viewAllButton}
                >
                  View All Events
                </Button>
              )}
            </View>
          )}

          {/* Recent Activity */}
          {dashboardData?.recentActivity && (
            <View style={styles.section}>
              <Title style={styles.sectionTitle}>Recent Activity</Title>
              <RecentActivityCard
                activities={dashboardData.recentActivity}
                onViewAll={() => navigation.navigate('Profile')}
              />
            </View>
          )}

          {/* Announcements */}
          {dashboardData?.announcements && dashboardData.announcements.length > 0 && (
            <View style={styles.section}>
              <Title style={styles.sectionTitle}>Announcements</Title>
              {dashboardData.announcements.slice(0, 2).map((announcement, index) => (
                <Animated.View
                  key={announcement.id}
                  style={[
                    useAnimatedStyle(() => ({
                      opacity: withDelay((index + 7) * 100, withSpring(1)),
                      transform: [
                        {
                          translateY: withDelay(
                            (index + 7) * 100,
                            withSpring(0, { damping: 15 })
                          ),
                        },
                      ],
                    })),
                  ]}
                >
                  <AnnouncementCard announcement={announcement} />
                </Animated.View>
              ))}
            </View>
          )}

          {/* Study Statistics */}
          {dashboardData?.studyStats && (
            <View style={styles.section}>
              <Title style={styles.sectionTitle}>Study Statistics</Title>
              <Card style={styles.statsCard}>
                <Card.Content>
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Icon
                        name="clock-outline"
                        size={24}
                        color={theme.colors.primary}
                      />
                      <Paragraph style={styles.statValue}>
                        {dashboardData.studyStats.totalHours}h
                      </Paragraph>
                      <Paragraph style={styles.statLabel}>
                        Total Study Time
                      </Paragraph>
                    </View>
                    
                    <Divider style={styles.statDivider} />
                    
                    <View style={styles.statItem}>
                      <Icon
                        name="trophy-outline"
                        size={24}
                        color={theme.colors.primary}
                      />
                      <Paragraph style={styles.statValue}>
                        {dashboardData.studyStats.completedCourses}
                      </Paragraph>
                      <Paragraph style={styles.statLabel}>
                        Completed Courses
                      </Paragraph>
                    </View>
                    
                    <Divider style={styles.statDivider} />
                    
                    <View style={styles.statItem}>
                      <Icon
                        name="fire"
                        size={24}
                        color={theme.colors.primary}
                      />
                      <Paragraph style={styles.statValue}>
                        {dashboardData.studyStats.streakDays}
                      </Paragraph>
                      <Paragraph style={styles.statLabel}>
                        Day Streak
                      </Paragraph>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </View>
          )}

          {/* Offline Content Reminder */}
          {!isOnline && (
            <View style={styles.section}>
              <Card style={styles.offlineCard}>
                <Card.Content>
                  <View style={styles.offlineContent}>
                    <Icon
                      name="wifi-off"
                      size={32}
                      color={theme.colors.primary}
                    />
                    <Title style={styles.offlineTitle}>
                      You're offline
                    </Title>
                    <Paragraph style={styles.offlineText}>
                      Access your downloaded content to continue learning
                    </Paragraph>
                    <Button
                      mode="contained"
                      onPress={() => navigation.navigate('OfflineContent')}
                      style={styles.offlineButton}
                    >
                      View Offline Content
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    flex: 1,
  },
  header: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  headerContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
  },
  greetingContainer: {
    marginLeft: 12,
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginTop: -4,
  },
  notificationButton: {
    borderColor: theme.colors.outline,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: theme.colors.onSurface,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  viewAllButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  statsCard: {
    borderRadius: 12,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    height: 40,
    width: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
    color: theme.colors.onSurface,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  offlineCard: {
    borderRadius: 12,
    elevation: 2,
    backgroundColor: theme.colors.surfaceVariant,
  },
  offlineContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  offlineTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    color: theme.colors.onSurface,
  },
  offlineText: {
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    color: theme.colors.onSurfaceVariant,
  },
  offlineButton: {
    borderRadius: 8,
  },
});
