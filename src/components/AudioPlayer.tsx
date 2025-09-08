import { useState, useEffect } from 'react'
import { audioService, type AudioTrack } from '../lib/audioService'

interface AudioPlayerProps {
  track: AudioTrack | null
  onTrackEnd?: () => void
  className?: string
}

export default function AudioPlayer({ track, onTrackEnd, className = '' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handlePlaybackUpdate = (playing: boolean, time: number) => {
      setIsPlaying(playing)
      setCurrentTime(time)
      setDuration(audioService.getDuration())
      
      if (!playing && time === 0 && duration > 0) {
        onTrackEnd?.()
      }
    }

    audioService.addListener(handlePlaybackUpdate)
    return () => audioService.removeListener(handlePlaybackUpdate)
  }, [duration, onTrackEnd])

  useEffect(() => {
    if (track) {
      setIsLoading(true)
      audioService.loadTrack(track).then((success) => {
        setIsLoading(false)
        if (success) {
          setDuration(audioService.getDuration())
          setVolume(audioService.getVolume())
        }
      })
    }
  }, [track])

  const togglePlayPause = async () => {
    if (isPlaying) {
      audioService.pause()
    } else {
      if (track) {
        const success = await audioService.play()
        if (!success) {
          console.error('Failed to play audio')
        }
      }
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    audioService.seekTo(time)
    setCurrentTime(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value)
    audioService.setVolume(vol)
    setVolume(vol)
  }

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!track) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 text-center ${className}`}>
        <p className="text-gray-500">No audio track selected</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      {/* Track Info */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="text-2xl">🎵</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{track.title}</h4>
          <p className="text-sm text-gray-600 truncate">{track.artist}</p>
        </div>
        {track.type === 'youtube' && (
          <div className="text-red-500 text-sm">YouTube</div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-3 mb-3">
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className="w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? '⏸️' : '▶️'}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            disabled={!track || isLoading}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-2">
        <span className="text-sm">🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-xs text-gray-500 w-8">{Math.round(volume * 100)}%</span>
      </div>

      {track.type === 'youtube' && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          ⚠️ YouTube playback is simulated. In production, this would use YouTube API.
        </div>
      )}

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}