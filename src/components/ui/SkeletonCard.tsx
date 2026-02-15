export const SkeletonCard = () => {
  return (
    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-dark-light/30 border border-dark-border/50 animate-pulse">
      <div className="w-full h-full bg-gradient-to-br from-dark-light/50 via-dark-light/30 to-dark-light/50" />
      
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
        <div className="h-4 bg-dark-light/70 rounded w-3/4" />
        <div className="h-3 bg-dark-light/50 rounded w-1/2" />
      </div>
    </div>
  );
};
