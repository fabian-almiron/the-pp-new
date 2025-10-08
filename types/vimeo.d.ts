declare global {
  interface Window {
    Vimeo?: {
      Player: new (element: HTMLElement, options: VimeoPlayerOptions) => VimeoPlayer;
    };
  }
}

interface VimeoPlayerOptions {
  id?: string | number;
  url?: string;
  width?: number | string;
  height?: number | string;
  responsive?: boolean;
  autoplay?: boolean;
  autopause?: boolean;
  background?: boolean;
  byline?: boolean;
  color?: string;
  controls?: boolean;
  dnt?: boolean;
  loop?: boolean;
  muted?: boolean;
  pip?: boolean;
  playsinline?: boolean;
  portrait?: boolean;
  quality?: 'auto' | '240p' | '360p' | '540p' | '720p' | '1080p' | '2k' | '4k';
  speed?: boolean;
  texttrack?: string;
  title?: boolean;
  transparent?: boolean;
}

interface VimeoPlayer {
  ready(): Promise<void>;
  destroy(): Promise<void>;
  setCurrentTime(seconds: number): Promise<number>;
  getCurrentTime(): Promise<number>;
  getDuration(): Promise<number>;
  play(): Promise<void>;
  pause(): Promise<void>;
  setVolume(volume: number): Promise<number>;
  getVolume(): Promise<number>;
  on(event: string, callback: Function): void;
  off(event: string, callback?: Function): void;
}

export {};
