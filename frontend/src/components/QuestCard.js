import React from 'react';
import { 
  Star, 
  Clock, 
  Trophy, 
  Lock, 
  CheckCircle, 
  BookOpen, 
  Shield, 
  Code,
  Play
} from 'lucide-react';

const QuestCard = ({ quest, isUnlocked, isCompleted, onStartQuest }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'basics': return <BookOpen className="h-5 w-5" />;
      case 'oop': return <Shield className="h-5 w-5" />;
      case 'data-structures': return <Code className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'basics': return 'from-blue-500 to-blue-600';
      case 'oop': return 'from-purple-500 to-purple-600';
      case 'data-structures': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className={`
      bg-glass-effect rounded-lg p-6 border transition-all duration-300 hover:scale-105 
      ${isCompleted ? 'border-green-500 bg-green-500/10' : 
        isUnlocked ? 'border-purple-500/50 hover:border-purple-400' : 
        'border-gray-600 opacity-75'}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`
          bg-gradient-to-r ${getCategoryColor(quest.category)} 
          rounded-full p-2 text-white
        `}>
          {getCategoryIcon(quest.category)}
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          {/* Difficulty Badge */}
          <div className={`
            ${getDifficultyColor(quest.difficulty)} 
            text-white text-xs px-2 py-1 rounded-full font-semibold uppercase
          `}>
            {quest.difficulty}
          </div>
          
          {/* Status Icon */}
          {isCompleted ? (
            <CheckCircle className="h-6 w-6 text-green-400" />
          ) : !isUnlocked ? (
            <Lock className="h-6 w-6 text-gray-400" />
          ) : null}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-white mb-2">
        {quest.title}
      </h3>

      {/* Description */}
      <p className="text-gray-300 mb-4 text-sm">
        {quest.description}
      </p>

      {/* Topics */}
      {quest.topics && (
        <div className="flex flex-wrap gap-2 mb-4">
          {quest.topics.map((topic, index) => (
            <span
              key={index}
              className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Info Row */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-yellow-400">
            <Star className="h-4 w-4" />
            <span>{quest.xp_reward} XP</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-400">
            <Clock className="h-4 w-4" />
            <span>{quest.estimated_time}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onStartQuest}
        disabled={!isUnlocked}
        className={`
          w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2
          ${isCompleted 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : isUnlocked 
              ? 'bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {isCompleted ? (
          <>
            <Trophy className="h-4 w-4" />
            <span>Completed</span>
          </>
        ) : !isUnlocked ? (
          <>
            <Lock className="h-4 w-4" />
            <span>Locked</span>
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            <span>Start Quest</span>
          </>
        )}
      </button>
    </div>
  );
};

export default QuestCard;