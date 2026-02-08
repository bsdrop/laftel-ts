export type Paginated<T> = {
  total: number;
  items: T[];
  next?: string;
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

export type AnimeAttributes = {
  adult: boolean;
  exclusive: boolean;
  original: boolean;
  laftelOnly: boolean;
  dubbed: boolean;
  uncensored: boolean;
  ending: boolean;
};

export type Anime = {
  id: number;
  title: string;
  description: string;
  images: ImageSet;
  genres: string[];
  format: string;
  attributes: AnimeAttributes;
  ageRating: number;
  userScore: number;
};

export type Episode = {
  id: number;
  index: string;
  title?: string;
  thumbnail?: string;
  duration?: string;
  free: boolean;
  viewing: boolean;
  publishedAt?: Date;
};

export type DRMInfo = {
  token: string | null;
  contentId: string;
  accessType: string;
};

export type StreamInfo = {
  drm?: DRMInfo;
  markers?: {
    opening?: TimeRange;
    ending?: TimeRange;
  };
  assets: {
    thumbnail?: string;
    subtitle?: string;
    hls?: string;
    dash?: string;
  };
  playLogId?: number;
};

export type Author = {
  id: number;
  name: string;
  avatar: string;
};

export type Interaction = {
  id: number;
  content: string;
  author: Author;
  createdAt?: Date;
  likes: number;
  spoiler: boolean;
  liked?: boolean;
};

export type Review = Interaction & {
  score: number;
};

export type Comment = Interaction & {
  replyCount?: number;
  parentId?: number;
};
