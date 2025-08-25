export const formatTime = (seconds: number, showMilliseconds = false): string => {
  const absSeconds = Math.abs(seconds);
  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const secs = Math.floor(absSeconds % 60);
  const milliseconds = Math.floor((absSeconds % 1) * 100);

  const sign = seconds < 0 ? '-' : '';

  if (hours > 0) {
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  const timeStr = `${sign}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  
  if (showMilliseconds) {
    return `${timeStr}.${milliseconds.toString().padStart(2, '0')}`;
  }
  
  return timeStr;
};

export const parseTimeInput = (input: string): number => {
  const parts = input.split(':').map(part => parseInt(part, 10));
  
  if (parts.length === 2) {
    // MM:SS format
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  
  return 0;
};