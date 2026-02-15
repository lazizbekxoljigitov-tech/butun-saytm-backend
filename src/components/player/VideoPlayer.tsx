import { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  ChevronRight,
  Monitor,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

interface VideoPlayerProps {
  url: string;
  qualities?: {
    '720p'?: string;
    '1080p'?: string;
    '4k'?: string;
  };
  onEnded?: () => void;
  title?: string;
  // Sync props for Watch Party
  externalState?: {
    currentTime: number;
    isPlaying: boolean;
    lastUpdate: number;
  };
  onStateChange?: (state: { currentTime: number; isPlaying: boolean }) => void;
  isSyncing?: boolean;
}

type Quality = '720p' | '1080p' | '1440p' | '4K (AI)';

export const VideoPlayer = ({ 
  url, 
  qualities, 
  onEnded, 
  title,
  externalState,
  onStateChange,
  isSyncing
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState<Quality>('1080p');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const controlsTimeoutRef = useRef<any>();
  const lastClickTime = useRef<number>(0);

  // Computed video source based on quality
  // If a specific URL exists for the quality, use it. Otherwise fall back to default 'url'
  // 4K (AI) always uses the best available source + CSS filters
  const videoSource = (() => {
    switch (quality) {
      case '720p': return qualities?.['720p'] || url;
      case '1080p': return qualities?.['1080p'] || url;
      case '1440p': return qualities?.['4k'] || qualities?.['1080p'] || url; // Use best available for 1440p upscale
      case '4K (AI)': return qualities?.['4k'] || qualities?.['1080p'] || url;
      default: return url;
    }
  })();

  // Progressive Quality Filters
  const videoFilters = (() => {
    switch (quality) {
      case '720p':
        // Clean and bright base
        return { 
          filter: 'contrast(1.05) saturate(1.1) brightness(1.05)',
          imageRendering: 'auto'
        };
      case '1080p':
        // Vibrant HD
        return { 
          filter: 'contrast(1.1) saturate(1.2) brightness(1.05)',
          imageRendering: 'auto'
        };
      case '1440p':
        // Deep colors and sharpness
        return { 
          filter: 'contrast(1.15) saturate(1.3) brightness(1.08)',
          imageRendering: 'high-quality' as any
        };
      case '4K (AI)':
        // Ultra-Vibrant "Retail Mode" look (Max brightness/smoothness)
        return { 
          filter: 'contrast(1.2) saturate(1.4) brightness(1.1)', 
          imageRendering: 'high-quality' as any
        };
      default:
        return { filter: 'none' };
    }
  })();

  const handleQualityChange = (q: Quality) => {
    if (q === quality) return;
    
    const time = videoRef.current?.currentTime || 0;
    const wasPlaying = !videoRef.current?.paused;
    setQuality(q);
    setShowQualityMenu(false);
    
    // Robust switching: Wait for data to load before seeking
    const video = videoRef.current;
    if (video) {
        const handleLoaded = () => {
            video.currentTime = time;
            if (wasPlaying) {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {
                        // Auto-play was prevented, handle or ignore
                    });
                }
            }
            video.removeEventListener('loadeddata', handleLoaded);
        };
        video.addEventListener('loadeddata', handleLoaded);
    }
  };

  const hideControls = useCallback(() => {
    if (isPlaying) {
      setShowControls(false);
      setShowQualityMenu(false);
    }
  }, [isPlaying]);

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(hideControls, 4000);
  }, [hideControls]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => {
        setIsPlaying(false);
        if (onEnded) onEnded();
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);
    
    // Sync Effect
    if (isSyncing && externalState && video) {
      const timeDiff = Math.abs(video.currentTime - externalState.currentTime);
      if (timeDiff > 1.5) { // Sync threshold
        video.currentTime = externalState.currentTime;
      }
      
      if (externalState.isPlaying && video.paused) video.play();
      if (!externalState.isPlaying && !video.paused) video.pause();
    }

    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [onEnded, videoSource]); // Re-bind on source change

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
      resetControlsTimeout();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePlayerClick = (e: React.MouseEvent) => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;
    const playerWidth = containerRef.current?.offsetWidth || 0;
    const clickX = e.nativeEvent.offsetX;

    if (timeSinceLastClick < 300) {
      // Double Click Detected
      if (clickX > playerWidth * 0.7) {
        // Double click right
        if (videoRef.current) videoRef.current.currentTime += 5;
      } else if (clickX < playerWidth * 0.3) {
        // Double click left
        if (videoRef.current) videoRef.current.currentTime -= 5;
      } else {
        // Double click center - Fullscreen
        toggleFullscreen();
      }
      lastClickTime.current = 0; // Reset
    } else {
      // Single Click
      togglePlay();
      lastClickTime.current = now;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
    resetControlsTimeout();
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  // Effect to handle Telegram Widget script injection
  useEffect(() => {
    const rawUrl = url;
    if (rawUrl.includes('t.me/')) {
      // Extract channel and post ID: https://t.me/Anizzers_uz/1541 -> Anizzers_uz/1541
      const parts = rawUrl.split('t.me/')[1]?.split('?')[0];
      if (parts) {
        setEmbedUrl(`telegram:${parts}`);
        // Cleanup previous widget
        const container = document.getElementById('telegram-post-container');
        if (container) container.innerHTML = '';
        
        const script = document.createElement('script');
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.setAttribute('data-telegram-post', parts);
        script.setAttribute('data-width', '100%');
        script.async = true;
        
        // Wait for container to be available
        setTimeout(() => {
          const target = document.getElementById('telegram-post-container');
          if (target) target.appendChild(script);
        }, 100);
      }
    } else if (rawUrl.includes('youtube.com/watch?v=') || rawUrl.includes('youtu.be/')) {
       const id = rawUrl.split('v=')[1]?.split('&')[0] || rawUrl.split('/').pop();
       setEmbedUrl(`https://www.youtube.com/embed/${id}`);
    } else {
       setEmbedUrl(null);
    }
  }, [url]);

  return (
    <div 
      ref={containerRef}
      className={`relative group w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-dark-border/30 transition-all duration-700 ${showControls ? 'cursor-default' : 'cursor-none'}`}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onTouchStart={resetControlsTimeout}
    >
      {embedUrl ? (
        embedUrl.startsWith('telegram:') ? (
          <div className="w-full h-full flex items-center justify-center bg-black p-4 overflow-y-auto">
             <div id="telegram-post-container" className="w-full max-w-md"></div>
          </div>
        ) : (
          <iframe
            src={embedUrl}
            className="w-full h-full border-none"
            allowFullScreen
            allow="autoplay; encrypted-media"
          />
        )
      ) : (
        <video
          ref={videoRef}
          src={videoSource}
          className="w-full h-full object-contain transition-all duration-500"
          style={{
            ...videoFilters,
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)'
          }}
          onClick={handlePlayerClick}
          playsInline
        />
      )}



      {/* Premium Overlay UI - Only show for direct videos as iframes have their own controls */}
      {!embedUrl && (
        <div className={`absolute inset-0 flex flex-col justify-between p-4 md:p-10 transition-all duration-500 ease-in-out pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Top bar: Glassmorphism Header */}
        <div className="flex items-center justify-between pointer-events-auto transform transition-transform duration-500 delay-75 translate-y-0">
          <div className="flex items-center gap-3 md:gap-4 bg-black/40 backdrop-blur-xl border border-white/10 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl max-w-[70%]">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(255,59,48,0.8)] shrink-0" />
            <h3 className="text-xs md:text-lg font-black italic uppercase tracking-tighter text-white truncate">{title || 'ANILEGEON Premium Player'}</h3>
          </div>
          
          <div className="flex items-center gap-3">
             <Button 
               variant="ghost" 
               size="icon" 
               onClick={() => setShowQualityMenu(!showQualityMenu)}
               aria-label="Video settings and quality"
               className={`w-9 h-9 md:w-10 md:h-10 bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:text-primary transition-all pointer-events-auto ${showQualityMenu ? 'text-primary border-primary/50' : ''}`}
             >
               <Settings size={18} className={showQualityMenu ? 'rotate-90 transition-transform' : 'md:hidden'} />
               <Settings size={20} className={showQualityMenu ? 'rotate-90 transition-transform' : 'hidden md:block'} />
             </Button>
          </div>
        </div>

        {/* Quality Menu Popover */}
        {showQualityMenu && (
          <div className="absolute top-16 md:top-24 right-4 md:right-10 w-48 md:w-56 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-3xl p-2 md:p-3 shadow-2xl z-50 pointer-events-auto animate-in fade-in zoom-in duration-200">
             <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-3 md:px-4 py-1.5 md:py-2 border-b border-white/5 mb-1 md:mb-2">{t('watchParty.select_anime')}</div>
             {(['720p', '1080p', '1440p', '4K (AI)'] as Quality[]).map((q) => (
               <button
                 key={q}
                 onClick={() => handleQualityChange(q)}
                 className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${quality === q ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
               >
                 <span className="flex items-center gap-3">
                    {q === '4K (AI)' ? <Zap size={14} className="text-yellow-400" /> : <Monitor size={14} />}
                    {q}
                 </span>
                 {quality === q && <ShieldCheck size={14} />}
               </button>
             ))}
          </div>
        )}

        {/* Center Indicators */}
        <div className="flex items-center justify-center pointer-events-none">
           <div className={`transform transition-all duration-500 ${!isPlaying && showControls ? 'scale-100 opacity-100' : 'scale-150 opacity-0'}`}>
              <div className="w-16 h-16 md:w-24 md:h-24 bg-primary/20 backdrop-blur-3xl border border-primary/30 rounded-full flex items-center justify-center">
                 <Play size={24} className="text-white fill-white ml-1 md:hidden" />
                 <Play size={40} className="text-white fill-white ml-2 hidden md:block" />
              </div>
           </div>
        </div>

        {/* Bottom bar: Glassmorphism Controls */}
        <div className="space-y-6 pointer-events-auto transform transition-transform duration-500 translate-y-0">
          
          {/* Progress Slider */}
          <div className="relative group/progress h-2 w-full bg-white/10 rounded-full cursor-pointer overflow-hidden backdrop-blur-sm">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Seek video"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-orange-500 shadow-[0_0_15px_rgba(255,59,48,0.5)] transition-all duration-100" 
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between bg-black/60 md:bg-black/40 backdrop-blur-2xl border border-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl">
            <div className="flex items-center gap-4 md:gap-8">
              <button 
                onClick={togglePlay} 
                aria-label={isPlaying ? "Pause video" : "Play video"}
                className="text-white hover:text-primary transition-all transform active:scale-90"
              >
                {isPlaying ? <Pause size={24} className="md:w-8 md:h-8" fill="currentColor" /> : <Play size={24} className="md:w-8 md:h-8" fill="currentColor" />}
              </button>
              
              <div className="text-[10px] md:text-xs font-black tracking-[0.1em] md:tracking-[0.2em] text-gray-300 font-mono">
                <span className="text-white">{formatTime(currentTime)}</span>
                <span className="mx-1.5 md:mx-3 opacity-30">/</span>
                <span className="opacity-50">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-8">
              <div className="flex items-center gap-2 md:gap-4 group/volume">
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX size={18} className="md:w-[22px] md:h-[22px]" /> : <Volume2 size={18} className="md:w-[22px] md:h-[22px]" />}
                </button>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    if (videoRef.current) videoRef.current.volume = v;
                    setIsMuted(v === 0);
                  }}
                  aria-label="Change volume"
                  className="w-16 md:w-20 accent-primary opacity-0 group-hover/volume:opacity-100 transition-all cursor-pointer hidden md:block"
                />
              </div>

              <div className="h-4 md:h-6 w-px bg-white/10" />

              <div className="flex items-center gap-2 md:gap-4">
                 <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary px-1.5 md:px-3 py-0.5 md:py-1 bg-primary/10 border border-primary/20 rounded-md md:rounded-lg">{quality}</div>
                 <button 
                   onClick={toggleFullscreen}
                   aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                   className="text-gray-400 hover:text-white transition-all transform hover:scale-110 active:scale-90"
                 >
                   <Maximize size={18} className="md:w-[22px] md:h-[22px]" />
                 </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Double Tap Visual Indicators */}
      <div className="absolute inset-0 flex pointer-events-none">
         <div className="flex-1 flex items-center justify-start pl-20 opacity-0 group-active:opacity-20 transition-opacity">
            <RotateCcw size={64} className="text-white" />
         </div>
         <div className="flex-1 flex items-center justify-end pr-20 opacity-0 group-active:opacity-20 transition-opacity">
            <RotateCw size={64} className="text-white" />
         </div>
      </div>


    </div>
  );
};
