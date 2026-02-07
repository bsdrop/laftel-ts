// 씨발 모든줄에 ts-ignore 마렵노 ts Tlqkf아
import * as Raw from "./raw.ts";
import * as Models from "./models.ts";

function parseKSTDate(dateValue: Date | string | number | unknown): Date | undefined {
    if (!dateValue) return undefined;
    if (dateValue instanceof Date) return dateValue;

    try {
        const date = new Date(dateValue as string | number);
        return isNaN(date.getTime()) ? undefined : date;
    } catch {
        return undefined;
    }
}

export const mapAnime = (raw: Raw.ItemsV4ID | Raw.HomeV1RecommendRanking): Models.Anime => {
    const flags = "is_exclusive" in raw ? {
        isAdult: !!raw.is_adult,
        isExclusive: !!raw.is_exclusive,
        isOriginal: !!raw.is_laftel_original,
        isLaftelOnly: !!raw.is_laftel_only,
        isDubbed: !!raw.is_dubbed,
        isUncensored: !!raw.is_uncensored,
        isEnding: !!raw.is_ending,
    } : {
        isAdult: !!raw.is_adult,
        isOriginal: !!raw.is_laftel_original,
        isLaftelOnly: !!raw.is_laftel_only,
        isDubbed: !!raw.is_dubbed,
        isUncensored: !!raw.is_uncensored,
        isEnding: !!raw.is_ending,
    };

    return {
        id: raw.id,
        name: raw.name,
        summary: (raw as Raw.ItemsV4ID).content,
        images: {
            thumbnail: raw.images?.find(img => img.option_name === "home_default")?.img_url,
            logo: (raw as Raw.ItemsV4ID).logo_img,
        },
        genres: (raw as Raw.HomeV1RecommendRanking).genres ?? (raw as Raw.ItemsV4ID).genre ?? [],
        medium: raw.medium ?? "기타",
        rating: (raw as Raw.ItemsV4ID).avg_rating ?? (raw as Raw.HomeV1RecommendRanking).rating ?? 0,
        ageLimit: (raw as Raw.ItemsV4ID).max_episode_rating?.rating as number ?? 0,
        flags,
    };
};

export const mapEpisode = (raw: Raw.EpisodesV3): Models.Episode => ({
    id: raw.id ?? 0,
    number: raw.episode_num ?? "",
    title: raw.subject,
    thumbnail: raw.thumbnail_path ?? undefined,
    duration: raw.running_time,
    isFree: !!raw.is_free,
    isViewing: !!raw.is_viewing,
    publishedAt: parseKSTDate(raw.published_datetime),
});

export const mapStreamInfo = (raw: Raw.StreamingInfoV2): Models.StreamInfo => {
    if ('protected_streaming_info' in raw) {
        const protectedInfo = raw.protected_streaming_info;
        const publicInfo = raw.public_streaming_info;
        const playbackInfo = raw.playback_info;
    } else throw new Error("TODO");

    return {
        urls: {
            hls: protectedInfo?.hls_url ?? publicInfo?.hls_preview_url ?? undefined,
            dash: protectedInfo?.dash_url ?? publicInfo?.dash_preview_url ?? undefined,
        },
        drm: protectedInfo ? {
            token: protectedInfo.widevine_token ?? protectedInfo.fairplay_token ?? null,
            contentId: protectedInfo.content_id ?? "",
            accessType: protectedInfo.access_type ?? "",
        } : undefined,
        markers: playbackInfo ? {
            opening: (playbackInfo.op_start != null && playbackInfo.op_end != null) ? {
                start: playbackInfo.op_start,
                end: playbackInfo.op_end,
            } : undefined,
            ending: (playbackInfo.ed_start != null && playbackInfo.ed_end != null) ? {
                start: playbackInfo.ed_start,
                end: playbackInfo.ed_end,
            } : undefined,
        } : undefined,
        assets: {
            thumbnail: publicInfo?.thumbnail ?? undefined,
            subtitle: protectedInfo?.subtitle_url as string | undefined,
        },
        playLogId: raw.play_log_id,
    };
};

export const mapInteraction = (raw: Raw.CommentItem | Raw.ReviewsV1MyReview): Models.Interaction => ({
    id: raw.id,
    content: raw.content,
    author: {
        id: raw.profile?.id,
        name: raw.profile?.name,
        avatar: raw.profile?.image,
    },
    createdAt: parseKSTDate(raw.created),
    likes: raw.count_like ?? 0,
    isSpoiler: !!raw.is_spoiler,
    isLiked: !!raw.is_click_like,
});
