
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Instagram, ExternalLink, RefreshCw } from 'lucide-react';
import InstagramPost from './InstagramPost';
import { useInstagramStore } from '../stores/instagramStore';

const InstagramFeed: React.FC = () => {
  const { posts, isLoading, error, fetchPosts, clearError } = useInstagramStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleRetry = () => {
    clearError();
    fetchPosts();
  };

  return;












































































































};

export default InstagramFeed;