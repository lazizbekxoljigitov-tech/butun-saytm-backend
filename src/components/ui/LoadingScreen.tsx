import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const LoadingScreen = () => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-[#0a0a0b] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Abstract Background Element */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="absolute w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full"
      />

      <div className="relative flex flex-col items-center">
        {/* Animated Logo Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2 
          }}
          className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,122,24,0.3)]"
        >
          <Play className="text-white fill-white ml-2" size={48} />
        </motion.div>

        {/* Animated Text */}
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ 
              duration: 0.8, 
              ease: [0.16, 1, 0.3, 1],
              delay: 0.4 
            }}
            className="text-6xl font-black italic uppercase tracking-tighter text-white"
          >
            ANILE<span className="text-primary">GEON</span>
          </motion.h1>
        </div>

        {/* Loading Progress Bar */}
        <div className="mt-12 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ 
              duration: 2.5,
              ease: "easeInOut",
              repeat: Infinity 
            }}
            className="w-full h-full bg-gradient-to-r from-transparent via-primary to-transparent"
          />
        </div>

        {/* Status Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            delay: 1 
          }}
          className="mt-6 text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]"
        >
          {t('common.loading')}
        </motion.p>
      </div>
    </motion.div>
  );
};
