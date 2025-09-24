
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, Clock, Zap } from 'lucide-react';
import { useTrustStore } from '../stores/trustStore';

interface SocialProofCounterProps {
  variant?: 'today' | 'total' | 'compact';
  showIcon?: boolean;
  animated?: boolean;
}

const SocialProofCounter: React.FC<SocialProofCounterProps> = ({
  variant = 'today',
  showIcon = true,
  animated = true
}) => {
  const {
    todayRegistrations,
    totalRegistrations,
    isAnimating,
    initializeCounts
  } = useTrustStore();

  const [displayCount, setDisplayCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    initializeCounts();
    setIsVisible(true);
  }, [initializeCounts]);

  // Animação do contador
  useEffect(() => {
    if (variant === 'today') {
      animateCount(displayCount, todayRegistrations);
    } else if (variant === 'total') {
      animateCount(displayCount, totalRegistrations);
    }
  }, [todayRegistrations, totalRegistrations, variant]);

  const animateCount = (from: number, to: number) => {
    if (!animated) {
      setDisplayCount(to);
      return;
    }

    const duration = 1000; // 1 segundo
    const steps = 20;
    const increment = (to - from) / steps;
    const stepDuration = duration / steps;

    let current = from;
    const timer = setInterval(() => {
      current += increment;
      if (current >= to) {
        current = to;
        clearInterval(timer);
      }
      setDisplayCount(Math.floor(current));
    }, stepDuration);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const variants = {
    today: {
      icon: Clock,
      prefix: '🔥',
      text: 'pessoas se cadastraram hoje',
      count: displayCount || todayRegistrations,
      bgColor: 'from-orange-600/20 to-red-600/20',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
      countColor: 'text-orange-300'
    },
    total: {
      icon: Users,
      prefix: '👥',
      text: 'usuários já confiam na plataforma',
      count: displayCount || totalRegistrations,
      bgColor: 'from-blue-600/20 to-purple-600/20',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      countColor: 'text-blue-300'
    },
    compact: {
      icon: TrendingUp,
      prefix: '📈',
      text: 'ativo agora',
      count: displayCount || todayRegistrations,
      bgColor: 'from-green-600/20 to-emerald-600/20',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-400',
      countColor: 'text-green-300'
    }
  };

  const config = variants[variant];
  const IconComponent = config.icon;

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="relative">

      {/* Pulse effect when animating */}
      <AnimatePresence>
        {isAnimating &&
        <motion.div
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.1, opacity: 0 }}
          exit={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className={`absolute inset-0 bg-gradient-to-r ${config.bgColor} rounded-lg blur-sm`} />

        }
      </AnimatePresence>

      {/* Main Counter */}
      




























































    </motion.div>);

};

export default SocialProofCounter;