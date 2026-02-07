export type Paginated<T> = {
  total: number;
  items: T[];
  next?: string | null;
};

export type ImageSet = {
  thumbnail?: string;
  poster?: string;
  banner?: string;
  logo?: string;
};

export type TimeRange = {
  start: number;
  end: number;
};

export type Profile = {
  id: number;
  name: string;
  avatar: string;
  status?: string;
  rank?: {
    level: number;
    days: number | null;
  };
  isMain: boolean;
  isLocked: boolean;
  ageRating: number;
};

export type Anime = {
  id: number;
  name: string;
  summary: string;
  images: ImageSet;
  genres: string[];
  medium: string;
  rating: number;
  ageLimit: number;

  flags: {
    isAdult: boolean;
    isExclusive: boolean;
    isOriginal: boolean;
    isLaftelOnly: boolean;
    isDubbed: boolean;
    isUncensored: boolean;
    isEnding: boolean;
  };
};

export type Episode = {
  id: number;
  number: string;
  title?: string;
  thumbnail?: string;
  duration?: string;
  isFree: boolean;
  isViewing: boolean;
  publishedAt?: Date;
};

export type StreamInfo = {
  urls: {
    hls?: string;
    dash?: string;
  };
  drm?: {
    token: string | null;
    contentId: string;
    accessType: string;
  };
  markers?: {
    opening?: TimeRange;
    ending?: TimeRange;
  };
  assets: {
    thumbnail?: string;
    subtitle?: string;
  };
  playLogId?: number;
};

export type Interaction = {
  id: number;
  content: string;
  author: {
    id: number;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  likes: number;
  isSpoiler: boolean;
  isLiked?: boolean;
};

export type Review = Interaction & {
  score: number;
};

export type Comment = Interaction & {
  replyCount?: number;
  parentId?: number | null;
};
