import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, Users, Heart, Play } from 'lucide-react';
import { Course } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface CourseCardProps {
  course: Course;
  showInstructor?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, showInstructor = true }) => {
  const { user } = useAuthStore();
  const { wishlist, addToWishlist, removeFromWishlist } = useAppStore();
  
  const isInWishlist = wishlist.some(item => item.courseId === course.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;
    
    if (isInWishlist) {
      removeFromWishlist(course.id);
    } else {
      addToWishlist({
        id: Date.now().toString(),
        userId: user.id,
        courseId: course.id,
        course,
        addedAt: new Date().toISOString(),
      });
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card hover className="overflow-hidden h-full">
        <div className="relative">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <Button variant="primary" size="sm" className="shadow-lg">
                <Play className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </motion.div>
          </div>

          {/* Level Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              course.level === 'BEGINNER' ? 'bg-accent-100 text-accent-800' :
              course.level === 'INTERMEDIATE' ? 'bg-warning-100 text-warning-800' :
              'bg-error-100 text-error-800'
            }`}>
              {course.level.toLowerCase()}
            </span>
          </div>

          {/* Wishlist Button */}
          {user && (
            <button
              onClick={handleWishlistToggle}
              className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full transition-colors hover:bg-white dark:hover:bg-gray-800"
            >
              <Heart 
                className={`w-4 h-4 ${
                  isInWishlist 
                    ? 'text-error-500 fill-current' 
                    : 'text-gray-600 dark:text-gray-400'
                }`} 
              />
            </button>
          )}
        </div>

        <div className="p-6">
          <div className="mb-3">
            <Link 
              to={`/courses/${course.id}`}
              className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 line-clamp-2 transition-colors"
            >
              {course.title}
            </Link>
          </div>

          {showInstructor && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              by {course.instructor.firstName} {course.instructor.lastName}
            </p>
          )}

          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {course.description}
          </p>

          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span>{course.rating.toFixed(1)}</span>
              <span className="ml-1">({course.totalRatings})</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{formatDuration(course.duration)}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{course.enrolledCount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {formatPrice(course.price)}
            </div>
            <Link to={`/courses/${course.id}`}>
              <Button variant="primary" size="sm">
                View Course
              </Button>
            </Link>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {course.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CourseCard;