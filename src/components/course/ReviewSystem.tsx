import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  User,
  Calendar,
  Edit3,
  Trash2,
  MessageCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Review {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  title: string;
  comment: string;
  date: string;
  helpful: number;
  notHelpful: number;
  userVote?: 'helpful' | 'not-helpful';
  isOwner: boolean;
}

interface ReviewSystemProps {
  courseId: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  userReview?: Review;
  onSubmitReview: (rating: number, title: string, comment: string) => void;
  onUpdateReview: (reviewId: string, rating: number, title: string, comment: string) => void;
  onDeleteReview: (reviewId: string) => void;
  onVoteReview: (reviewId: string, vote: 'helpful' | 'not-helpful') => void;
  onReportReview: (reviewId: string) => void;
}

const ReviewSystem: React.FC<ReviewSystemProps> = ({
  courseId,
  reviews,
  averageRating,
  totalReviews,
  userReview,
  onSubmitReview,
  onUpdateReview,
  onDeleteReview,
  onVoteReview,
  onReportReview
}) => {
  const { user } = useAuthStore();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingReview) {
      onUpdateReview(editingReview, rating, title, comment);
      setEditingReview(null);
    } else {
      onSubmitReview(rating, title, comment);
    }
    
    setShowReviewForm(false);
    setRating(5);
    setTitle('');
    setComment('');
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review.id);
    setRating(review.rating);
    setTitle(review.title);
    setComment(review.comment);
    setShowReviewForm(true);
  };

  const handleCancel = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    setRating(5);
    setTitle('');
    setComment('');
  };

  const renderStars = (currentRating: number, interactive = false, size = 'w-5 h-5') => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type={interactive ? 'button' : undefined}
        onClick={interactive ? () => setRating(i + 1) : undefined}
        onMouseEnter={interactive ? () => setHoveredStar(i + 1) : undefined}
        onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
        className={interactive ? 'cursor-pointer' : 'cursor-default'}
        disabled={!interactive}
      >
        <Star
          className={`${size} ${
            i < (interactive ? (hoveredStar || rating) : currentRating)
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300 dark:text-gray-600'
          } ${interactive ? 'hover:text-yellow-400' : ''}`}
        />
      </button>
    ));
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      distribution[review.rating - 1]++;
    });
    return distribution.reverse(); // 5 stars first
  };

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center space-x-1 mb-2">
              {renderStars(averageRating)}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars, index) => (
              <div key={stars} className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
                  {stars}★
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: totalReviews > 0 ? `${(ratingDistribution[index] / totalReviews) * 100}%` : '0%'
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                  {ratingDistribution[index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Write Review */}
      {user && !userReview && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Write a Review
            </h3>
            {!showReviewForm && (
              <Button onClick={() => setShowReviewForm(true)}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Write Review
              </Button>
            )}
          </div>

          <AnimatePresence>
            {showReviewForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center space-x-1">
                    {renderStars(rating, true)}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Review Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summarize your experience"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about this course..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <Button type="submit" variant="primary">
                    {editingReview ? 'Update Review' : 'Submit Review'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* User's Review */}
      {userReview && (
        <Card className="p-6 border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Review
            </h3>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(userReview)}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteReview(userReview.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-3">
            {renderStars(userReview.rating)}
            <span className="font-medium text-gray-900 dark:text-white">
              {userReview.title}
            </span>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {userReview.comment}
          </p>

          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{new Date(userReview.date).toLocaleDateString()}</span>
          </div>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Student Reviews
        </h3>

        {reviews.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No reviews yet
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Be the first to share your experience with this course!
            </p>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  {review.user.avatar ? (
                    <img
                      src={review.user.avatar}
                      alt={review.user.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  )}
                </div>

                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {review.user.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {renderStars(review.rating, false, 'w-4 h-4')}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {!review.isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReportReview(review.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Flag className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Content */}
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    {review.title}
                  </h5>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {review.comment}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => onVoteReview(review.id, 'helpful')}
                      className={`flex items-center space-x-1 text-sm transition-colors ${
                        review.userVote === 'helpful'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Helpful ({review.helpful})</span>
                    </button>
                    
                    <button
                      onClick={() => onVoteReview(review.id, 'not-helpful')}
                      className={`flex items-center space-x-1 text-sm transition-colors ${
                        review.userVote === 'not-helpful'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>Not helpful ({review.notHelpful})</span>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSystem;
