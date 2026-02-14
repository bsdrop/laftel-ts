// \r\n같은 변태 규격 표준화하기
import * as Raw from "../types/raw.ts";
import * as Models from "../types/models.ts";

function toDate(value: Date | string | number): Date | undefined {
  if (!value) return undefined;

  if (value instanceof Date) return isNaN(value.getTime()) ? undefined : value;

  if (typeof value === "string") {
    let v = value.trim();

    if (
      !v.includes("Z") &&
      !v.includes("+") &&
      !v.includes("ST") &&
      !v.includes("MT") &&
      !v.includes("TC")
    )
      v += "+09:00";
    if (v.indexOf(" ") == 10) v = v.replace(" ", "T");

    const d = new Date(v);
    return isNaN(d.getTime()) ? undefined : d;
  }

  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

export const mapAnime = (
  raw: Raw.ItemsV4ID | Raw.HomeV1RecommendRanking,
): Models.Anime => {
  return {
    id: raw.id,
    title: raw.name,
    description: raw.content,
    images: {
      thumbnail: (
        raw.images?.find((img) => img.option_name === "home_default") || void 0
      )?.img_url, //raw.images?.at(0)
      logo: raw.logo_img,
    },
    genres:
      (raw as Raw.HomeV1RecommendRanking).genres ??
      (raw as Raw.ItemsV4ID).genre ??
      [],
    format: raw.medium ?? "기타",
    attributes: {
      adult: raw.is_adult,
      exclusive: raw.is_exclusive,
      original: raw.is_laftel_original,
      laftelOnly: raw.is_laftel_only,
      dubbed: raw.is_dubbed,
      uncensored: raw.is_uncensored,
      ending: raw.is_ending,
    },
    userScore: raw.avg_rating ?? raw.rating,
    ageRating: raw.max_episode_rating?.rating,
  };
};

export const mapEpisode = (raw: Raw.EpisodesV3): Models.Episode => ({
  id: raw.id,
  index: raw.episode_num.replace("화", ""),
  title: raw.subject,
  thumbnail: raw.thumbnail_path || undefined,
  duration: raw.running_time,
  free: raw.is_free,
  viewing: raw.is_viewing,
  publishedAt: raw.published_datetime
    ? toDate(raw.published_datetime) || null
    : null,
});

export const mapStreamInfo = (raw: Raw.StreamingInfoV2): Models.StreamInfo => {
  const protectedInfo = raw.protected_streaming_info;
  const publicInfo = raw.public_streaming_info;
  const playback = raw.playback_info;

  return {
    drm: protectedInfo
      ? {
          token:
            protectedInfo?.widevine_token ??
            protectedInfo?.fairplay_token ??
            null,
          contentId: protectedInfo.content_id,
          accessType: protectedInfo.access_type,
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
    id: raw.profile?.id,
    name: raw.profile?.name,
    avatar: raw.profile?.image,
  },
  createdAt: toDate(raw.created),
  likes: raw.count_like || 0, // FIXME: 입막음
  spoiler: raw.is_spoiler,
  liked: raw.is_click_like,
});
