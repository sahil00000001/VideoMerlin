import { forwardRef, useState, useImperativeHandle, useRef } from "react";
import ReactPlayer from "react-player";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Maximize, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReactPlayerInstance {
  seekTo: (amount: number, type?: 'seconds' | 'fraction') => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getSecondsLoaded: () => number;
}

interface VideoPlayerProps {
  url: string;
  playing: boolean;
  playbackRate: number;
  onPlayingChange: (playing: boolean) => void;
  onTimeUpdate: (time: number) => void;
  onPlaybackRateChange: (rate: number) => void;
}

const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

const VideoPlayer = forwardRef<ReactPlayerInstance, VideoPlayerProps>(
  ({ url, playing, playbackRate, onPlayingChange, onTimeUpdate, onPlaybackRateChange }, ref) => {
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [showControls, setShowControls] = useState(true);

    // Expose the ReactPlayer ref to parent
    useImperativeHandle(ref, () => ({
      seekTo: (amount: number, type?: 'seconds' | 'fraction') => {
        if (playerRef.current) {
          playerRef.current.seekTo(amount, type);
        }
      },
      getCurrentTime: () => {
        return playerRef.current?.getCurrentTime() || 0;
      },
      getDuration: () => {
        return playerRef.current?.getDuration() || 0;
      },
      getSecondsLoaded: () => {
        return playerRef.current?.getSecondsLoaded() || 0;
      }
    }));

    const handleProgress = (state: any) => {
      if (!seeking) {
        setPlayed(state.played);
        onTimeUpdate(state.playedSeconds);
      }
      if (state.loadedSeconds > 0 && duration === 0) {
        const currentDuration = playerRef.current?.getDuration();
        if (currentDuration && currentDuration > 0) {
          setDuration(currentDuration);
        }
      }
    };

    const handleSeekChange = (value: number[]) => {
      setPlayed(value[0]);
    };

    const handleSeekMouseDown = () => {
      setSeeking(true);
    };

    const handleSeekMouseUp = (value: number[]) => {
      setSeeking(false);
      if (playerRef.current) {
        playerRef.current.seekTo(value[0], 'fraction');
      }
    };

    const handleFullscreen = () => {
      if (containerRef.current) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          containerRef.current.requestFullscreen();
        }
      }
    };

    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onPlayingChange(!playing);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (playerRef.current) {
          playerRef.current.seekTo(Math.max(0, played * duration - 5), 'seconds');
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (playerRef.current) {
          playerRef.current.seekTo(Math.min(duration, played * duration + 5), 'seconds');
        }
      }
    };

    const handleError = (error: any) => {
      // Suppress benign browser media API errors
      if (error?.message?.includes('interrupted')) {
        return;
      }
      console.error('Video player error:', error);
    };

    return (
      <Card
        ref={containerRef}
        className="overflow-hidden bg-black group"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(playing)}
        onKeyDown={handleKeyPress}
        tabIndex={0}
        data-testid="video-player-container"
      >
        <div className="relative aspect-video">
          <ReactPlayer
            ref={playerRef}
            url={url}
            playing={playing}
            volume={volume}
            muted={muted}
            playbackRate={playbackRate}
            onProgress={handleProgress}
            onReady={() => {
              const currentDuration = playerRef.current?.getDuration();
              if (currentDuration && currentDuration > 0) {
                setDuration(currentDuration);
              }
            }}
            onError={handleError}
            width="100%"
            height="100%"
            progressInterval={100}
          />

          {/* Controls Overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300",
              showControls ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
              {/* Progress Bar */}
              <div className="space-y-1">
                <Slider
                  value={[played]}
                  min={0}
                  max={0.999999}
                  step={0.001}
                  onValueChange={handleSeekChange}
                  onPointerDown={handleSeekMouseDown}
                  onPointerUp={() => handleSeekMouseUp([played])}
                  className="cursor-pointer"
                  data-testid="video-progress-slider"
                />
                <div className="flex items-center justify-between text-xs text-white font-mono">
                  <span data-testid="video-current-time">{formatTime(played * duration)}</span>
                  <span data-testid="video-duration">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => onPlayingChange(!playing)}
                    data-testid="button-play-pause"
                  >
                    {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() => setMuted(!muted)}
                      data-testid="button-mute"
                    >
                      {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                    <Slider
                      value={[muted ? 0 : volume]}
                      min={0}
                      max={1}
                      step={0.1}
                      onValueChange={(val) => {
                        setVolume(val[0]);
                        setMuted(val[0] === 0);
                      }}
                      className="w-24"
                      data-testid="volume-slider"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        data-testid="button-playback-speed"
                      >
                        <Gauge className="h-4 w-4 mr-2" />
                        {playbackRate}x
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {playbackSpeeds.map((speed) => (
                        <DropdownMenuItem
                          key={speed}
                          onClick={() => onPlaybackRateChange(speed)}
                          className={cn(
                            speed === playbackRate && "bg-accent"
                          )}
                          data-testid={`speed-option-${speed}`}
                        >
                          {speed}x
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={handleFullscreen}
                    data-testid="button-fullscreen"
                  >
                    <Maximize className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
