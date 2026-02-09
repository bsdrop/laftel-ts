import * as Raw from "./raw.ts";
import * as Models from "./models.ts";

function toDate(dateValue: Date | string | number | unknown): Date | undefined {
  if (!dateValue) return undefined;
  if (dateValue instanceof Date) return dateValue;
  if (
    dateValue instanceof String &&
    //dateValue.includes("T") &&
    (!dateValue.includes("+") || !dateValue.includes("Z"))
  )
    dateValue += "+09:00";
  try {
    const date = new Date(dateValue as string | number);
    return isNaN(date.getTime()) ? undefined : date;
  } catch {
    return undefined;
  }
}

export const mapAnime = (
  raw: Raw.ItemsV4ID | Raw.HomeV1RecommendRanking,
): Models.Anime => {
  const isFull = "is_exclusive" in raw;

  return {
    id: raw.id,
    title: raw.name,
    description: (raw as Raw.ItemsV4ID).content ?? "",
    images: {
      thumbnail: raw.images?.find((img) => img.option_name === "home_default")
        ?.img_url,
      logo: (raw as Raw.ItemsV4ID).logo_img,
    },
    genres:
      (raw as Raw.HomeV1RecommendRanking).genres ??
      (raw as Raw.ItemsV4ID).genre ??
      [],
    format: raw.medium ?? "기타",
    attributes: {
      adult: !!raw.is_adult,
      exclusive: isFull ? !!raw.is_exclusive : false,
      original: !!raw.is_laftel_original,
      laftelOnly: !!raw.is_laftel_only,
      dubbed: !!raw.is_dubbed,
      uncensored: !!raw.is_uncensored,
      ending: !!raw.is_ending,
    },
    userScore:
      (raw as Raw.ItemsV4ID).avg_rating ??
      (raw as Raw.HomeV1RecommendRanking).rating ??
      0,
    ageRating: (raw as Raw.ItemsV4ID).max_episode_rating?.rating ?? 0,
  };
};

export const mapEpisode = (raw: Raw.EpisodesV3): Models.Episode => ({
  id: raw.id ?? 0,
  index: raw.episode_num ?? "",
  title: raw.subject,
  thumbnail: raw.thumbnail_path,
  duration: raw.running_time,
  free: !!raw.is_free,
  viewing: !!raw.is_viewing,
  publishedAt: toDate(raw.published_datetime),
});

export const mapStreamInfo = (raw: Raw.StreamingInfoV2): Models.StreamInfo => {
  const protectedInfo = raw.protected_streaming_info;
  const publicInfo = raw.public_streaming_info;
  const playback = raw.playback_info;

  return {
    drm: protectedInfo
      ? {
          token:
            protectedInfo.widevine_token ??
            protectedInfo.fairplay_token ??
            null,
          contentId: protectedInfo.content_id ?? "",
          accessType: protectedInfo.access_type ?? "",
        }
      : undefined,
    markers: playback
      ? {
          opening:
            playback.op_start != null && playback.op_end != null
              ? { start: playback.op_start, end: playback.op_end }
              : undefined,
          ending:
            playback.ed_start != null && playback.ed_end != null
              ? { start: playback.ed_start, end: playback.ed_end }
              : undefined,
        }
      : undefined,
    assets: {
      thumbnail: publicInfo?.thumbnail,
      subtitle: protectedInfo?.subtitle_url,
      hls: protectedInfo?.hls_url,
      dash: protectedInfo?.dash_url,
      preview: {
        hls: publicInfo?.hls_preview_url,
        dash: publicInfo?.dash_preview_url,
      },
    },
    playLogId: raw.play_log_id,
  };
};

export const mapInteraction = (
  raw: Raw.CommentItem | Raw.ReviewsV1MyReview,
): Models.Interaction => ({
  id: raw.id,
  content: raw.content,
  author: {
    id: raw.profile?.id ?? 0,
    name: raw.profile?.name ?? "",
    avatar: raw.profile?.image ?? "",
  },
  createdAt: toDate(raw.created),
  likes: raw.count_like ?? 0,
  spoiler: !!raw.is_spoiler,
  liked: !!raw.is_click_like,
});
