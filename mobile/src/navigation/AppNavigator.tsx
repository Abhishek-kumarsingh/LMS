import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Platform } from 'react-native';

// Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { CourseDetailScreen } from '../screens/CourseDetailScreen';
import { LessonScreen } from '../screens/LessonScreen';
import { AssignmentsScreen } from '../screens/AssignmentsScreen';
import { AssignmentDetailScreen } from '../screens/AssignmentDetailScreen';
import { GradesScreen } from '../screens/GradesScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { OfflineContentScreen } from '../screens/OfflineContentScreen';
import { VideoPlayerScreen } from '../screens/VideoPlayerScreen';
import { LiveStreamScreen } from '../screens/LiveStreamScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { DiscussionScreen } from '../screens/DiscussionScreen';
import { SearchScreen } from '../screens/SearchScreen';

// Components
import { CustomTabBar } from '../components/navigation/CustomTabBar';
import { DrawerContent } from '../components/navigation/DrawerContent';
import { HeaderRight } from '../components/navigation/HeaderRight';

// Types
import { RootStackParamList, TabParamList, DrawerParamList } from '../types/navigation';
import { theme } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.surface,
      },
      headerTintColor: theme.colors.onSurface,
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}
  >
    <Stack.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        title: 'Dashboard',
        headerRight: () => <HeaderRight />,
      }}
    />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{ title: 'Notifications' }}
    />
    <Stack.Screen
      name="Search"
      component={SearchScreen}
      options={{ title: 'Search' }}
    />
  </Stack.Navigator>
);

const CoursesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.surface,
      },
      headerTintColor: theme.colors.onSurface,
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}
  >
    <Stack.Screen
      name="CoursesList"
      component={CoursesScreen}
      options={{
        title: 'My Courses',
        headerRight: () => <HeaderRight />,
      }}
    />
    <Stack.Screen
      name="CourseDetail"
      component={CourseDetailScreen}
      options={({ route }) => ({
        title: route.params?.course?.title || 'Course',
      })}
    />
    <Stack.Screen
      name="Lesson"
      component={LessonScreen}
      options={({ route }) => ({
        title: route.params?.lesson?.title || 'Lesson',
        headerBackTitleVisible: false,
      })}
    />
    <Stack.Screen
      name="VideoPlayer"
      component={VideoPlayerScreen}
      options={{
        headerShown: false,
        orientation: 'landscape',
      }}
    />
    <Stack.Screen
      name="LiveStream"
      component={LiveStreamScreen}
      options={{
        headerShown: false,
        orientation: 'landscape',
      }}
    />
    <Stack.Screen
      name="Quiz"
      component={QuizScreen}
      options={({ route }) => ({
        title: route.params?.quiz?.title || 'Quiz',
        headerBackTitleVisible: false,
      })}
    />
    <Stack.Screen
      name="Discussion"
      component={DiscussionScreen}
      options={{ title: 'Discussion' }}
    />
  </Stack.Navigator>
);

const AssignmentsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.surface,
      },
      headerTintColor: theme.colors.onSurface,
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}
  >
    <Stack.Screen
      name="AssignmentsList"
      component={AssignmentsScreen}
      options={{
        title: 'Assignments',
        headerRight: () => <HeaderRight />,
      }}
    />
    <Stack.Screen
      name="AssignmentDetail"
      component={AssignmentDetailScreen}
      options={({ route }) => ({
        title: route.params?.assignment?.title || 'Assignment',
      })}
    />
  </Stack.Navigator>
);

const GradesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.surface,
      },
      headerTintColor: theme.colors.onSurface,
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}
  >
    <Stack.Screen
      name="GradesList"
      component={GradesScreen}
      options={{
        title: 'Grades',
        headerRight: () => <HeaderRight />,
      }}
    />
  </Stack.Navigator>
);

const MessagesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.surface,
      },
      headerTintColor: theme.colors.onSurface,
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}
  >
    <Stack.Screen
      name="MessagesList"
      component={MessagesScreen}
      options={{
        title: 'Messages',
        headerRight: () => <HeaderRight />,
      }}
    />
    <Stack.Screen
      name="Chat"
      component={ChatScreen}
      options={({ route }) => ({
        title: route.params?.conversation?.title || 'Chat',
      })}
    />
  </Stack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{
      headerShown: false,
      tabBarHideOnKeyboard: Platform.OS === 'android',
    }}
  >
    <Tab.Screen
      name="DashboardTab"
      component={DashboardStack}
      options={{
        tabBarLabel: 'Dashboard',
        tabBarIcon: ({ color, size }) => (
          <Icon name="view-dashboard" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="CoursesTab"
      component={CoursesStack}
      options={{
        tabBarLabel: 'Courses',
        tabBarIcon: ({ color, size }) => (
          <Icon name="book-open-variant" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="AssignmentsTab"
      component={AssignmentsStack}
      options={{
        tabBarLabel: 'Assignments',
        tabBarIcon: ({ color, size }) => (
          <Icon name="clipboard-text" color={color} size={size} />
        ),
        tabBarBadge: 3, // Dynamic badge for pending assignments
      }}
    />
    <Tab.Screen
      name="GradesTab"
      component={GradesStack}
      options={{
        tabBarLabel: 'Grades',
        tabBarIcon: ({ color, size }) => (
          <Icon name="chart-line" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="MessagesTab"
      component={MessagesStack}
      options={{
        tabBarLabel: 'Messages',
        tabBarIcon: ({ color, size }) => (
          <Icon name="message-text" color={color} size={size} />
        ),
        tabBarBadge: 2, // Dynamic badge for unread messages
      }}
    />
  </Tab.Navigator>
);

const DrawerNavigator = () => (
  <Drawer.Navigator
    drawerContent={(props) => <DrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerStyle: {
        backgroundColor: theme.colors.surface,
        width: 280,
      },
      drawerActiveTintColor: theme.colors.primary,
      drawerInactiveTintColor: theme.colors.onSurface,
    }}
  >
    <Drawer.Screen
      name="MainTabs"
      component={TabNavigator}
      options={{
        drawerLabel: 'Home',
        drawerIcon: ({ color, size }) => (
          <Icon name="home" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name="Calendar"
      component={CalendarScreen}
      options={{
        drawerLabel: 'Calendar',
        drawerIcon: ({ color, size }) => (
          <Icon name="calendar" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name="OfflineContent"
      component={OfflineContentScreen}
      options={{
        drawerLabel: 'Offline Content',
        drawerIcon: ({ color, size }) => (
          <Icon name="download" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        drawerLabel: 'Profile',
        drawerIcon: ({ color, size }) => (
          <Icon name="account" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        drawerLabel: 'Settings',
        drawerIcon: ({ color, size }) => (
          <Icon name="cog" color={color} size={size} />
        ),
      }}
    />
  </Drawer.Navigator>
);

export const AppNavigator: React.FC = () => {
  return <DrawerNavigator />;
};
