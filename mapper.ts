import * as Raw from "./raw.ts";
import * as Models from "./models.ts";

function toDate(dateValue: Date | string | number): Date | undefined {
  if (!dateValue) return undefined;
  if (dateValue instanceof Date) return dateValue;
  if (
    typeof dateValue === "string" &&
    //dateValue.includes("T") &&
    (!dateValue.includes("+") || !dateValue.includes("Z"))
  )
    dateValue += "+09:00";
  try {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? undefined : date;
  } catch {
    return undefined;
  }
}

export const mapAnime = (
  raw: Raw.ItemsV4ID | Raw.HomeV1RecommendRanking,
): Models.Anime => {
  return {
    id: raw.id,
    title: raw.name,
    description: raw.content,
    images: {
      thumbnail: raw.images?.find((img) => img.option_name === "home_default")
        ?.img_url,
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
          protectedInfo?.fairplay_token ?? // fairplay인 이상 인생 망함 playready도 아니고 ㅋㅋ
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
