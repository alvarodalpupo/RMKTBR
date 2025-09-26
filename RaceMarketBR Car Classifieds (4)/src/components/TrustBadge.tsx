
import React from 'react';
import { Shield, Lock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrustBadgeProps {
  variant?: 'secure' | 'verified' | 'protected';
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

const TrustBadge: React.FC<TrustBadgeProps> = ({
  variant = 'secure',
  size = 'md',
  showPulse = true
}) => {
  const variants = {
    secure: {
      icon: Lock,
      text: 'Site Seguro',
      bgColor: 'from-green-600 to-green-700',
      borderColor: 'border-green-500',
      glowColor: 'shadow-green-500/50'
    },
    verified: {
      icon: CheckCircle,
      text: 'Plataforma Verificada',
      bgColor: 'from-blue-600 to-blue-700',
      borderColor: 'border-blue-500',
      glowColor: 'shadow-blue-500/50'
    },
    protected: {
      icon: Shield,
      text: 'Dados Protegidos',
      bgColor: 'from-emerald-600 to-emerald-700',
      borderColor: 'border-emerald-500',
      glowColor: 'shadow-emerald-500/50'
    }
  };

  const sizes = {
    sm: {
      container: 'px-3 py-2',
      icon: 'w-4 h-4',
      text: 'text-xs',
      glow: 'shadow-sm'
    },
    md: {
      container: 'px-4 py-3',
      icon: 'w-5 h-5',
      text: 'text-sm',
      glow: 'shadow-md'
    },
    lg: {
      container: 'px-6 py-4',
      icon: 'w-6 h-6',
      text: 'text-base',
      glow: 'shadow-lg'
    }
  };

  const config = variants[variant];
  const sizeConfig = sizes[size];
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative inline-flex items-center">

      {/* Pulse Animation Background */}
      {showPulse &&
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`absolute inset-0 bg-gradient-to-r ${config.bgColor} rounded-full blur-sm ${config.glowColor}`} />

      }

      {/* Main Badge */}
      















      {/* Sparkle Effect */}
      













    </motion.div>);

};

export default TrustBadge;