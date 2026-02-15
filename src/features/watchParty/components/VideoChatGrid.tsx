import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff } from 'lucide-react';
import { useRoomsStore } from '../store/roomsStore';
import { useWatchPartyUserStore } from '../store/userStore';
import { peerService } from '../services/peerService';
import toast from 'react-hot-toast';

export const VideoChatGrid = () => {
  const { currentRoom } = useRoomsStore();
  const { user } = useWatchPartyUserStore();
  const participants = currentRoom?.participants || [];

  const [localMic, setLocalMic] = useState(true);
  const [localCam, setLocalCam] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>();

  // Setup audio level detection
  useEffect(() => {
    if (peerService.myStream && localMic) {
      try {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const source = audioContext.createMediaStreamSource(peerService.myStream);
        source.connect(analyser);
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const detectSpeaking = () => {
          analyser.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setIsSpeaking(avg > 15);
          animFrameRef.current = requestAnimationFrame(detectSpeaking);
        };
        detectSpeaking();
      } catch (err) {
        // Audio API not available
      }
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      audioContextRef.current?.close();
    };
  }, [localMic]);

  useEffect(() => {
    if (localVideoRef.current && peerService.myStream) {
      localVideoRef.current.srcObject = peerService.myStream;
    }
  }, [localCam, localMic]);

  const toggleMic = () => {
    if (peerService.myStream) {
      const audioTrack = peerService.myStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !localMic;
        setLocalMic(!localMic);
      }
    } else {
      toast.error('Microphone not available');
    }
  };

  const toggleCam = () => {
    if (peerService.myStream) {
      const videoTrack = peerService.myStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !localCam;
      }
    }
    setLocalCam(!localCam);
  };

  const handleLeaveVoice = () => {
    peerService.destroy();
    setLocalMic(false);
    setLocalCam(false);
    toast.success('Disconnected from voice');
  };

  return (
    <div className="h-full bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-4 flex flex-col gap-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          Voice & Video
          <span className="text-[10px] text-gray-500 bg-white/[0.06] px-2 py-0.5 rounded-full">{participants.length}</span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={toggleMic}
            className={`p-2.5 rounded-xl transition-all duration-200 border ${
              localMic
                ? isSpeaking
                  ? 'bg-green-500/20 text-green-400 border-green-500/30 shadow-lg shadow-green-500/20'
                  : 'bg-green-500/10 text-green-400 border-green-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}
            title={localMic ? 'Mute' : 'Unmute'}
          >
            {localMic ? <Mic size={16} /> : <MicOff size={16} />}
          </button>
          <button
            onClick={toggleCam}
            className={`p-2.5 rounded-xl transition-all duration-200 border ${
              localCam
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}
            title={localCam ? 'Turn off camera' : 'Turn on camera'}
          >
            {localCam ? <VideoIcon size={16} /> : <VideoOff size={16} />}
          </button>
          <button
            onClick={handleLeaveVoice}
            className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-200"
            title="Leave Voice"
          >
            <PhoneOff size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Local User */}
        <div className={`relative aspect-video bg-[#111118] rounded-xl overflow-hidden group border-2 transition-all duration-300 ${
          isSpeaking && localMic ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-white/[0.06]'
        }`}>
          {/* Avatar fallback */}
          <div className="w-full h-full flex items-center justify-center absolute inset-0 z-0">
            <div className={`relative transition-all duration-300 ${isSpeaking && localMic ? 'scale-110' : ''}`}>
              <img
                src={user?.avatar}
                alt={user?.username}
                className={`w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  isSpeaking && localMic
                    ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                    : localMic
                      ? 'border-green-500/40'
                      : 'border-white/10'
                }`}
              />
              {isSpeaking && localMic && (
                <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-30" />
              )}
            </div>
          </div>

          <video
            ref={localVideoRef}
            autoPlay
            muted
            className={`w-full h-full object-cover relative z-10 transition-opacity duration-300 ${localCam ? 'opacity-100' : 'opacity-0'}`}
          />

          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-20">
            <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">You</span>
            <div className={`p-1 rounded-full transition-all ${localMic ? 'bg-green-500/80 text-white' : 'bg-black/60 text-red-400'}`}>
              {localMic ? <Mic size={9} /> : <MicOff size={9} />}
            </div>
          </div>
        </div>

        {/* Remote Participants */}
        {participants.filter(p => p.id !== user?.id).map((participant) => (
          <div key={participant.id} className="relative aspect-video bg-[#111118] rounded-xl overflow-hidden group border-2 border-white/[0.06] transition-all">
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={participant.avatar}
                alt={participant.username}
                className="w-12 h-12 rounded-full border-2 border-white/10"
              />
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md truncate backdrop-blur-sm">
                {participant.username}
              </span>
              <div className={`p-1 rounded-full ${participant.isMuted ? 'bg-black/60 text-red-400' : 'bg-green-500/80 text-white'}`}>
                {participant.isMuted ? <MicOff size={9} /> : <Mic size={9} />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
