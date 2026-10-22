
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, ExternalLink } from 'lucide-react';
import { InstagramPost as InstagramPostType } from '../types/instagram';

interface InstagramPostProps {
  post: InstagramPostType;
  index: number;
}

const InstagramPost: React.FC<InstagramPostProps> = ({ post, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    }
  };

  const truncateCaption = (caption: string, maxLength: number = 80) => {
    if (!caption) return '';
    return caption.length > maxLength ? caption.substring(0, maxLength) + '...' : caption;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <motion.div
      initial={{ y: 30 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative aspect-square overflow-hidden rounded-xl bg-primary-gray">

      {/* Loading Placeholder */}
      {!imageLoaded && !imageError &&
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse flex items-center justify-center">
          <Instagram className="w-8 h-8 text-gray-600" />
        </div>
      }

      {/* Error Placeholder */}
      {imageError &&
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center">
          <Instagram className="w-8 h-8 text-gray-500 mb-2" />
          <span className="text-gray-500 text-xs font-montserrat">Erro ao carregar</span>
        </div>
      }

      {/* Instagram Image */}
      {!imageError &&
      <img
        src={post.media_url}
        alt={post.caption || 'Post do Instagram'}
        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
        imageLoaded ? 'opacity-100' : 'opacity-0'}`
        }
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy" />

      }

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          {/* Caption */}
          {post.caption &&
          <p className="font-montserrat text-sm mb-3 leading-relaxed">
              {truncateCaption(post.caption)}
            </p>
          }

          {/* Footer */}
          <div className="flex items-center justify-end">
            <span className="text-xs text-gray-300 font-montserrat">
              {formatDate(post.timestamp)}
            </span>
          </div>
        </div>

        {/* Instagram Icon */}
        <div className="absolute top-4 right-4">
          <Instagram className="w-6 h-6 text-white/80" />
        </div>

        {/* Link to Instagram */}
        <a
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir post no Instagram"
          className="absolute inset-0"
        />
      </div>

      {/* External Link Icon */}
      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-primary-red rounded-full p-2">
          <ExternalLink className="w-4 h-4 text-white" />
        </div>
      </div>
    </motion.div>);

};

export default InstagramPost;