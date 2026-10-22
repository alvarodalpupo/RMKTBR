
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

  // Sem posts e sem erro (ex.: token não configurado): não ocupa espaço na Home
  if (!isLoading && !error && posts.length === 0) return null;

  return (
    <section className="py-16 bg-primary-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ y: 20 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Instagram className="w-8 h-8 text-pink-500" />
            <h2 className="font-bebas text-4xl text-white">SIGA A GENTE NO INSTAGRAM</h2>
          </div>
          <a
            href="https://instagram.com/racemarketbr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-gray-400 hover:text-white font-montserrat transition-colors"
          >
            <span>@racemarketbr</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>

        {isLoading && posts.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-primary-gray rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-gray-400 font-montserrat mb-4">Não foi possível carregar os posts agora.</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center space-x-2 bg-primary-gray hover:bg-gray-800 border border-gray-700 text-white font-montserrat px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tentar novamente</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {posts.map((post, index) => (
              <InstagramPost key={post.id} post={post} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default InstagramFeed;