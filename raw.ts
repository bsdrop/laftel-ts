export type PaginatedResponse<T> = {
  count: number | null;
  next?: string | unknown;
  previous?: string | unknown;
  results?: T[];
};

export type CommonOptionName = "home_default" | "home_custom" | (string & {});

export type CommonImage = {
  option_name?: CommonOptionName;
  img_url?: string;
  crop_ratio?: string;
};

export type CommonHighlightVideo = {
  content_id?: string;
  dash_url?: string;
  hls_url?: string;
};

export type CommonContentRating =
  | "전체 이용가"
  | "7세 이용가"
  | "12세 이용가"
  | "15세 이용가"
  | "성인 이용가"
  | (string & {});

export type CommonRatingType =
  | "방송통신심의위원회"
  | "영상물등급위원회"
  | (string & {});

export type CommonMedium = "TVA" | "극장판" | "OVA" | "기타" | (string & {});

export type CommonRatingComponent =
  | "선정성"
  | "주제"
  | "폭력성"
  | "모방위험"
  | "대사"
  | "공포"
  | "약물"
  | (string & {});
// KCC/영등위 상 가능성 있음: 차별, 혐오, 도박, 범죄, 음주, 흡연, 담배, 충격, 언어, 음란성, 유해정보

export type MaxEpisodeRating = {
  rating?: number | unknown;
  rating_type?: CommonRatingType | unknown;
  classification_number?: string;
  broadcast_channel_name?: string;
  broadcast_date?: Date | unknown;
  rating_components?: CommonRatingComponent[] | unknown[];
};

export type CommonPerson = { name?: string; role?: string };
export type CommonCast = {
  character_name?: string;
  voice_actor_names?: string[];
};
export type CommonProductionCompany = { name?: string };

export type Version = {
  current?: string;
  required?: string;
  required_build_number?: number;
};

export type ProfileRank = {
  rank?: number;
  continued_membership_days?: number | unknown;
};

export type ProfilesV1MyProfile =
  | {
      id: number;
      account_id: number;
      name: string;
      image: string;
      status: string;
      profile_rank: ProfileRank;
      is_locked: boolean;
      is_for_kids: boolean;
      content_rating: number;
      is_default: boolean;
      is_main: boolean;
    }
  | WTF;

export type ProfilesV2ID = Omit<ProfilesV1MyProfile, "is_for_kids">;
export type ProfilesV2List = PaginatedResponse<ProfilesV2ID>;

export type ProfilesV1MyAccount =
  | {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      verified_email?: string;
      is_duplicated_email?: boolean;
      has_password?: boolean;
      certified?: boolean;
      is_adult?: boolean;
      is_agree_to_terms?: boolean;
      account_types?: string[];
      asset_point?: number;
      has_pay_password?: boolean;
    }
  | {
      detail?: string;
      code?: string;
    }
  | WTF;

export type ItemsV4ID = {
  id: number;
  uid: string; // <<<<<<<< 이씨발련 뭐임???????????? 갑자기 생김
  name: string;
  content: string;
  is_adult: boolean;
  is_uncensored: boolean;
  is_dubbed: boolean;
  is_laftel_only: boolean;
  is_laftel_original: boolean;
  is_ending: boolean;
  is_exclusive: boolean;
  is_avod: boolean;
  is_svod: boolean;
  is_new_release: boolean;
  is_upcoming_release: boolean;
  is_episode_existed: boolean;
  medium: CommonMedium;
  images: CommonImage[];
  genre: string[];
  release_weekdays: string[];
  latest_episode_release_datetime: string;
  avg_rating: number;
  logo_img: string | null;
  color_code: string | null;
  description: string | null;
  is_viewing: boolean;
  highlight_video: CommonHighlightVideo | null;
  awards: string[];
  notice: string;
  tags: string[];
  production: string | null;
  air_year_quarter: string | null;
  copyright: string;
  author: unknown[];
  illustrator: unknown[];
  expire_datetime: string | null;
  series_id: number | null;
  max_episode_rating: MaxEpisodeRating;
  directors: CommonPerson[];
  casts: CommonCast[];
  production_companies: CommonProductionCompany[];
  simulcast_channel: unknown | null;
};

export type ItemList = ItemsV4ID;

export type ItemsV1ScheduledExpiredItem = PaginatedResponse<{
  expire_date_with_hour?: Date | string;
  items?: Array<{
    id?: number;
    name?: string;
    images?: CommonImage[];
  }>;
}>;

export type ItemsV2SeriesID = PaginatedResponse<{
  id: number;
  name: string;
  img: string;
  content_rating: CommonContentRating;
  images: CommonImage[];
}>;

export type EpisodeProduct = {
  id?: number;
  name?: string;
  list_price?: number;
  period?: string;
  promotion?: null | unknown;
};

export type EpisodesV3 = {
  id: number;
  title: string;
  subject: string;
  description: string;
  episode_num: string;
  episode_order: number;
  thumbnail_path: string | null;
  has_preview: boolean;
  item_expire_datetime: string | null;
  in_app_download: boolean;
  is_avod: boolean;
  is_free: boolean;
  is_viewing: boolean;
  published_datetime: string | null;
  running_time: string;
  progressbar: null | number;
  episode_products: EpisodeProduct[];
  rating: MaxEpisodeRating;
  access_info_list: unknown[];
  access_type: string;
  is_final: boolean;
};

export type CommentsV1List = PaginatedResponse<{
  id: number;
  parent_comment_id: number | null;
  profile: ProfilesV1MyProfile;
  content: string;
  item: Partial<ItemsV4ID>;
  episode: {
    id?: number;
    subject?: string;
    episode_num?: string;
    thumbnail_path?: string | null;
  };
  created: Date | unknown;
  modified: Date | unknown;
  count_like: number;
  count_reply_comment: number;
  is_click_like: boolean;
  is_spoiler: boolean;
}>;

export type CommentItem = {
  id?: number;
  parent_comment_id?: number | null;
  profile?: ProfilesV1MyProfile;
  content?: string;
  item?: Partial<ItemsV4ID>;
  episode?: {
    id?: number;
    subject?: string;
    episode_num?: string;
    thumbnail_path?: string | null;
  };
  created?: Date | unknown;
  modified?: Date | unknown;
  count_like?: number;
  count_reply_comment?: number;
  is_click_like?: boolean;
  is_spoiler?: boolean;
};
// POST https://api.laftel.net/api/comments/v1/list/ {"episode":90290,"content":"와샌즈","is_spoiler":true}  / {"episode":90290,"content":"답글 (타래)","is_spoiler":true,"parent_comment":1450349}-> 201
// PATCH https://api.laftel.net/api/comments/v1/1450349/ {"content":"크흠","is_spoiler":false} -> 200
// PA:TCH https://api.laftel.net/api/comments/v1/1450349/like/  {"is_active":true} -> 200
// PA:TCH https://api.laftel.net/api/comments/v1/1450349/like/  {"is_active":false} -> 200
// DELETE https://api.laftel.net/api/comments/v1/1450349/ -> 204

export type HomeV1RecommendRanking = {
  id?: number;
  name?: string;
  img?: string;
  cropped_img?: string;
  is_adult?: boolean;
  images?: CommonImage[];
  genres?: string[];
  highlight_video?: CommonHighlightVideo | null;
  is_laftel_only?: boolean;
  is_laftel_original?: boolean;
  is_uncensored?: boolean;
  is_dubbed?: boolean;
  is_avod?: boolean;
  is_viewing?: boolean;
  content_rating?: CommonContentRating;
  rating?: number;
  rating_type?: CommonRatingType;
  medium?: CommonMedium;
  is_ending?: boolean;
};

export type SearchV2Daily = HomeV1RecommendRanking & {
  latest_episode_created?: Date | null;
  latest_published_datetime?: Date | null;
  is_exclusive?: boolean;
  is_episode_existed?: boolean;
  is_expired?: boolean;
  distributed_air_time?: string;
  distributed_air_times?: string[];
  distributed_air_time_sequence?: number;
};

export type SearchV3Keyword = PaginatedResponse<
  HomeV1RecommendRanking & {
    home_img?: string;
    home_cropped_img?: string;
    latest_episode_created?: Date | null;
    latest_published_datetime?: Date | null;
    is_episode_existed?: boolean;
    is_expired?: boolean;
    is_exclusive?: boolean;
    distributed_air_time?: string | null;
  }
>;

export type SearchV1AutoComplete = string[];

export type V1Status = {
  status?: string;
  ip?: string;
  country_code?: string;
  ios_version?: Version;
  android_version?: Version;
  local_ad?: boolean;
  ios_app_version?: number;
  android_app_version?: number;
  env?: string;
};

export type CarouselsV2List = {
  id?: number;
  web_img?: string;
  mobile_img?: string;
  logo_img?: string;
  content?: string;
  label?: string;
  button_text?: string;
  is_adult?: boolean;
  item_destination?: number | null;
  event_destination?: number | null;
  theme_destination?: unknown;
  external_destination?: string | null;
};

export type MembershipsV1Current = {
  product?: MembershipProduct;
  promotion?: unknown | null;
  expire_datetime?: Date | string;
  max_profile_count?: number;
  upgrade_type?: string;
  purchase_token?: string;
};

export type NotificationsV2Settings = {
  notification_topic: string;
  is_enabled: boolean;
}[];

export type ProfilesV1MyProfileStatistics = {
  finished_item_count?: number;
  rating_count?: number;
  short_review_count?: number;
  comment_count?: number;
};

export type MembershipProduct = {
  id?: number;
  name?: string;
  membership_type?: "basic" | "premium"; // | (string & {});
  list_price?: number;
  period?: string;
  promotion?: unknown | null;
  provider?: string;
  is_active_renewable?: boolean;
};

export type BillingInfo = {
  id?: number;
  created?: string;
  modified?: string;
  pg_type?: string;
  billing_type?: string;
  card_name?: null | string;
  card_number?: null | string;
  phone_number?: null | string;
  is_svod_billing_info?: boolean;
};

export type BillingV1Info = BillingInfo[] | WTF;

export type MembershipsV1Reserved = {
  status?: string;
  next_payment_date?: Date;
  product?: MembershipProduct;
  billing_info?: BillingInfo;
  on_hold_info?: null | unknown;
  pg_on_hold_info?: null | unknown;
};

export type MembershipsV1Upgrade = {
  upgrade_available?: boolean;
  days?: number;
};

export type WTF =
  | {
      detail?: string | unknown;
      error?: unknown;
      code?: string | unknown;
      data?: null | unknown;
      msg?: string | unknown;
      ip?: string | unknown;
      country_code?: string | unknown;
    }
  | { detail: "재생 가능 시간 초과"; code: "PLAYBACK_EXPIRED" }
  | {
      detail: "대한민국 이외 지역에서는\n저작권 문제로 시청할 수 없습니다.";
      code: "BLOCKED_BY_DISALLOWED_ACCESS";
      data: null;
    }
  | {
      code?: "PLAYBACK_DEACTIVATED" | string;
      detail?: Array<{
        user_id: number;
        profile_name: string;
        item_name: string;
        device_type: string;
      }>;
    }
  | {
      detail: "episode_ids, item_id 중에 하나는 필수 값 입니다.";
      code: "INVALID";
    };

export type AuthResponse = {
  user: ProfilesV1MyAccount;
  key: string;
  method: "email" | "google" | "kakao" | string;
  is_restored: boolean;
  is_registered: boolean;
};

export type AccountsPasswordReset = {
  msg: string;
  email: string;
  expire_datetime: string;
};

export type ProductsV3MembershipProducts = {
  products: MembershipProduct[];
};

export type PlaybackInfo = {
  op_start?: number | null;
  op_end?: number | null;
  ed_start?: number | null;
  ed_end?: number | null;
  episode_id?: number;
  episode_num?: string;
  action_time?: number;
  progressbar?: unknown | null;
  access_type?: string;
  episode_type?: string;
};

export type ProductsInfo = {
  point?: number;
  products?: Array<{
    product_no?: string;
    name?: string;
    is_rental?: boolean;
    price?: number;
  }>;
};

export type ProtectedStreamingInfo = {
  content_id?: string;
  access_type?: string;
  widevine_token?: string | null;
  fairplay_token?: string | null;
  playready_token?: string | null;
  dash_url?: string;
  hls_url?: string;
  subtitle_url?: unknown;
};

export type PublicStreamingInfo = {
  dash_preview_url?: string | null;
  hls_preview_url?: string | null;
  thumbnail?: string | null;
  subtitle_preview_url?: string | null;
};

export type StreamingInfoV2 =
  | {
      is_cartoon_network?: boolean;
      playback_info?: PlaybackInfo;
      products_info?: ProductsInfo;
      protected_streaming_info?: ProtectedStreamingInfo;
      public_streaming_info?: PublicStreamingInfo;
      play_log_id?: number;
    }
  | {
      code?: "PLAYBACK_DEACTIVATED" | string;
      detail?: Array<{
        user_id: number;
        profile_name: string;
        item_name: string;
        device_type: string;
      }>;
    }
  | WTF;

// DELETE https://api.laftel.net/api/items/v1/44283/recent-video/ -> 204; 최근 기록 삭제
export type EpisodesV1IDRecentVideo =
  | (StreamingInfoV2 & {
      next_episode?: {
        id?: number;
        episode_num?: string;
      };
    })
  | WTF;

export type EpisodesV3IDVideo = StreamingInfoV2;

export type CommonBroadcastType = "replay" | "original";
export type CommonNotificationStatus = "unread" | "read";

export type LiveV1Programs = {
  id?: number;
  start_datetime?: Date;
  end_datetime?: Date;
  title?: string;
  episode_title?: string;
  broadcast_type?: CommonBroadcastType | string;
  content_rating?: number;
  series?: number | null;
  item?: number | null;
  item_name?: null;
};

export type NotificationsV2List = PaginatedResponse<{
  id?: number;
  type?: string;
  notification_type?: string;
  status?: CommonNotificationStatus;
  extra_data?: {
    type?: string;
    rating?: number;
    item_id?: number;
    episode_id?: number;
  };
  title?: string;
  description?: string;
  content?: string;
  icon?: string;
  image?: string;
  created?: Date;
  end_datetime?: null | Date;
}>;

export type ItemsV1Hot = PaginatedResponse<{
  id?: number;
  images?: CommonImage[];
  name?: string;
  content_rating?: CommonContentRating;
  rating?: number;
}>;

export type EventsV2List = PaginatedResponse<{
  id?: number;
  name?: string;
  img?: string;
  banner_img?: string;
  start_datetime?: Date;
  end_datetime?: Date;
  rating?: number;
  status?: string;
}>;

export type ItemsV3IDUser = {
  continue_episode_id?: number;
  is_wish?: boolean;
  is_hate?: boolean;
};

export type UsersV1BannedWords = {
  banned_word_list?: string[];
  replacement_word?: string;
};

//  POST{"previous_recommends":["OP104","OP413","OP372","OP303","ST0","OP413","OP36","OP392","OP63","OP318","OP198","OP257","OP387","OP248","OP462"]}
export type HomeV2Recommend5 = {
  id?: string;
  type?: string;
  name?: string;
  item_list?: ItemList[];
}[];

export type HomeV1RecommendRankingGenre = {
  genre?: string;
  statistics_type?: string;
  item_list?: ItemList[];
};

export type ItemsV1Purchasable = {
  purchasable?: boolean;
  purchase_type?: string;
};

export type V10ProductResult = {
  product_no?: number;
  product_code?: string;
  product_name?: string;
  supply_price?: number;
  price?: number;
  detail_image?: string;
  discount_rate?: number;
  detail_page_path?: string;
  badges?: string[];
};

// https://store-api.laftel.net/v1.0/products/item_related/?item_id=
export type V10ProductsItemRelated = PaginatedResponse<V10ProductResult>;

export type ItemsV2RelatedResult = {
  id?: number;
  name?: string;
  img?: string;
  cropped_img?: string;
  images?: CommonImage[];
  is_adult?: boolean;
  is_uncensored?: boolean;
  is_dubbed?: boolean;
  is_viewing?: boolean;
  is_laftel_only?: boolean;
  is_laftel_original?: boolean;
  is_exclusive?: boolean;
  is_avod?: boolean;
  medium?: CommonMedium | string;
  is_episode_existed?: boolean;
  latest_episode_created?: null | Date;
  average_score?: number;
  rating?: number;
};

export type ItemsV2IDRelated = PaginatedResponse<ItemsV2RelatedResult>;

export type ItemsV1IDStatistics = {
  average_score?: string;
  count_score?: number;
  count_score_05?: number;
  count_score_10?: number;
  count_score_15?: number;
  count_score_20?: number;
  count_score_25?: number;
  count_score_30?: number;
  count_score_35?: number;
  count_score_40?: number;
  count_score_45?: number;
  count_score_50?: number;
};

export type ReviewsV1MyReview = {
  id?: null | number;
  is_click_like?: boolean;
  count_like?: number;
  profile?: ProfilesV1MyProfile;
  content?: string;
  is_spoiler?: boolean;
  score?: number;
  item?: null | number;
  created?: null | Date;
  modified?: null | Date;
};

// POST https://api.laftel.net/api/reviews/v1/list/ {"item":44284,"score":5,"content":"","is_spoiler":false} -> 201 {}
// PATCH https://api.laftel.net/api/reviews/v1/35910015/ {"score":3.5,"content":"","is_spoiler":false} -> 200

export type LiveV1Channels = {
  channel?: {
    name?: string;
    display_name?: string;
    logo?: string;
    logo_square?: string;
    logo_sharing?: string;
    dash_url?: string;
    hls_url?: string;
  };
  current_program?: LiveV1Programs;
  current_thumbnail?: string;
};

export type EpisodesV1VideoPermission =
  | PaginatedResponse<{
      episode_id?: number;
      in_app_download?: boolean;
      membership_end_datetime?: null | Date;
      item_expire_datetime?: null | Date;
      access_type?: null | unknown;
      access_info_list?: unknown[];
    }>
  | {
      detail: "episode_ids, item_id 중에 하나는 필수 값 입니다.";
      code: "INVALID";
    }
  | WTF;

export type PlayLogsV1ID = {
  total_play_time?: string;
  play_end_offset?: string;
  is_player_exit?: boolean;
  is_player_paused?: boolean;
} | null;

export type PaymentsV2Billing =
  | {
      error?: string;
      code?: string;
    }
  | WTF
  | unknown;

export type PaymentsV2PayPasswordCheck =
  | {
      is_check_available?: boolean;
      fail_count?: number;
      fail_count_limit?: number;
    }
  | {
      error?: string;
      code?: string;
    };
