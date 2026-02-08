import * as Raw from "./raw.ts";
import * as Models from "./models.ts";
import * as Mappers from "./mapper.ts";

export interface ClientConfig {
  baseUrl?: string;
  token?: string;
  userAgent?: string;
}

export class LaftelClient {
  private config: Required<ClientConfig>;

  constructor(config: ClientConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl ?? "https://api.laftel.net/api",
      token: config.token ?? "",
      userAgent:
        config.userAgent ??
        "Mozilla/5.0 (compatible; LaftelTS +https://github.com/bsdrop/laftel-ts)",
    };
  }

  setToken(token: string) {
    return (this.config.token = token);
  }

  setUserAgent(ua: string) {
    this.config.userAgent = ua;
  }

  async login(email: string, password: string): Promise<false | string> {
    const res = await this._request<Raw.AuthResponse>(
      "/authentications/v3/email/",
      {
        method: "POST",
        body: JSON.stringify({ username: email, password }),
      },
    );
    if (res.key) {
      return this.setToken(res.key);
    }
    return false;
  }

  async getAnime(id: number): Promise<Models.Anime> {
    const raw = await this._request<Raw.ItemsV4ID>(`/items/v4/${id}/`);
    return Mappers.mapAnime(raw);
  }

  async getEpisodes(
    animeId: number,
    options: {
      limit?: number;
      offset?: number;
      sort?: "oldest" | "newest";
    } = {},
  ): Promise<Models.Paginated<Models.Episode>> {
    const { limit = 20, offset = 0, sort = "oldest" } = options;
    const res = await this._request<Raw.PaginatedResponse<Raw.EpisodesV3>>(
      `/episodes/v3/list/?item_id=${animeId}&limit=${limit}&offset=${offset}&sort=${sort}&show_playback_offset=true`,
    );
    return {
      total: res.count ?? 0,
      items: (res.results ?? []).map(Mappers.mapEpisode),
      next: (res.next as string | null) || void 0,
    };
  }
  async getEpisode(episodeId: number): Promise<Models.Episode> {
    return Mappers.mapEpisode(
      await this._request<Raw.EpisodesV3>(`/episodes/v3/${episodeId}`),
    );
  }

  /**
   * // TODO: 주석달기
   */
  async getRecentVideo(episodeId: number): Promise<Models.StreamInfo | null> {
    const res = await this._request<Raw.EpisodesV1IDRecentVideo>(
      `/episodes/v1/${episodeId}/recent-video/`,
    );
    if ("code" in res && res.code === "INVALID") return null;
    return Mappers.mapStreamInfo(res as Raw.StreamingInfoV2);
  }

  /** @param ignoreLimit - True인 경우, 자동으로 updatePlayback 호출하여 플레이어를 종료했다고 전달합니다. */
  async getVideoStream(
    episodeId: number,
    ignoreLimit: boolean = false,
  ): Promise<Models.StreamInfo> {
    const raw = await this._request<Raw.StreamingInfoV2>(
      `/episodes/v3/${episodeId}/video/?device=Web`,
      {},
      true,
    );
    if (ignoreLimit && "play_log_id" in raw)
      await this.updatePlayback(raw.play_log_id!, {
        exited: true,
        paused: true,
      });
    return Mappers.mapStreamInfo(raw);
  }

  /**
   * 재생 상태를 업데이트합니다.
   * @param {number} playLogId - getVideoStream을 통해 얻은 재생 로그 ID
   * @param {Object} status - 업데이트할 재생 상태 객체
   * @param {string} [status.playTime="00:00:00"] - 재생 시간 (형식: HH:MM:SS)
   * @param {string} [status.offset="00:00:00"] - 오프셋 위치 (형식: HH:MM:SS)
   */
  async updatePlayback(
    playLogId: number,
    status: {
      playTime?: string;
      offset?: string;
      exited?: boolean;
      paused?: boolean;
    },
  ): Promise<boolean> {
    return (
      (
        await this._request<Response>(
          `/play_logs/${playLogId}/`,
          {
            method: "PATCH",
            body: JSON.stringify({
              total_play_time: status.playTime ?? "00:00:00",
              play_end_offset: status.offset ?? "00:00:00",
              is_player_exit: status.exited ?? true,
              is_player_paused: status.paused ?? true,
            }),
          },
          true,
          true,
        )
      ).status === 200
    );
  }

  async autoComplete(keyword: string): Promise<string[]> {
    return this._request<string[]>(
      `/search/v1/auto_complete/?keyword=${encodeURIComponent(keyword)}`,
    );
  }

  async search(keyword: string): Promise<Models.Paginated<Models.Anime>> {
    const res = await this._request<Raw.SearchV3Keyword>(
      `/search/v3/keyword/?keyword=${encodeURIComponent(keyword)}`,
    );
    return {
      total: res.count ?? 0,
      items: (res.results ?? []).map((item) => Mappers.mapAnime(item)),
      next: (res.next as string | null) || void 0,
    };
  }

  async getComments(
    episodeId: number,
    options: {
      limit?: number;
      offset?: number;
      sorting?: string;
    } = {},
  ): Promise<Models.Paginated<Models.Comment>> {
    const { limit = 10, offset = 0, sorting = "top" } = options;
    const res = await this._request<Raw.CommentsV1List>(
      `/comments/v1/list/?episode_id=${episodeId}&limit=${limit}&offset=${offset}&sorting=${sorting}`,
    );
    return {
      total: res.count ?? 0,
      items: (res.results ?? []).map(
        Mappers.mapInteraction,
      ) as Models.Comment[],
      next: (res.next as string | null) || void 0,
    };
  }

  async addComment(
    episodeId: number,
    content: string,
    options: {
      isSpoiler?: boolean;
      parentId?: number;
    } = {},
  ): Promise<Models.Comment> {
    const res = await this._request<Raw.CommentItem>("/comments/v1/list/", {
      method: "POST",
      body: JSON.stringify({
        episode: episodeId,
        content,
        is_spoiler: options.isSpoiler ?? false,
        parent_comment: options.parentId,
      }),
    });
    return Mappers.mapInteraction(res) as Models.Comment;
  }

  async editComment(
    commentId: number,
    content: string,
    isSpoiler?: boolean,
  ): Promise<Models.Comment> {
    const res = await this._request<Raw.CommentItem>(
      `/comments/v1/${commentId}/`,
      {
        method: "PATCH",
        body: JSON.stringify({
          content,
          is_spoiler: isSpoiler ?? false,
        }),
      },
      true,
    );
    return Mappers.mapInteraction(res) as Models.Comment;
  }

  async deleteComment(commentId: number): Promise<boolean> {
    return (
      (
        await this._request<Response>(
          `/comments/v1/${commentId}/`,
          { method: "DELETE" },
          true,
          true,
        )
      )?.status === 204
    );
  }

  async likeComment(
    commentId: number,
    isActive: boolean = true,
  ): Promise<boolean> {
    return (
      (
        await this._request<Response>(
          `/comments/v1/${commentId}/like/`,
          {
            method: "PATCH",
            body: JSON.stringify({ is_active: isActive }),
          },
          true,
          true,
        )
      )?.status === 200
    );
  }

  async unlikeComment(commentId: number): Promise<boolean> {
    return await this.likeComment(commentId, false);
  }

  async getReviews(
    animeId: number,
    options: {
      limit?: number;
      offset?: number;
      sorting?: string;
    } = {},
  ): Promise<Models.Paginated<Models.Review>> {
    const { limit = 10, offset = 0, sorting = "top" } = options;
    const res = await this._request<
      Raw.PaginatedResponse<Raw.ReviewsV1MyReview>
    >(
      `/reviews/v1/list/?item_id=${animeId}&limit=${limit}&offset=${offset}&sorting=${sorting}`,
    );
    return {
      total: res.count ?? 0,
      items: (res.results ?? []).map(Mappers.mapInteraction) as Models.Review[],
      next: (res.next as string | null) || void 0,
    };
  }

  async addReview(
    animeId: number,
    content: string,
    score: number,
    options: {
      isSpoiler?: boolean;
    } = {},
  ): Promise<Models.Review> {
    const res = await this._request<Raw.ReviewsV1MyReview>(
      "/reviews/v1/list/",
      {
        method: "POST",
        body: JSON.stringify({
          item: animeId,
          content,
          score,
          is_spoiler: options.isSpoiler ?? false,
        }),
      },
    );
    return Mappers.mapInteraction(res) as Models.Review;
  }

  async editReview(
    reviewId: number,
    score: number,
    content: string,
    isSpoiler?: boolean,
  ): Promise<Models.Review> {
    const res = await this._request<Raw.ReviewsV1MyReview>(
      `/reviews/v1/${reviewId}/`,
      {
        method: "PATCH",
        body: JSON.stringify({
          score,
          content,
          is_spoiler: isSpoiler ?? false,
        }),
      },
    );
    return Mappers.mapInteraction(res) as Models.Review;
  }

  async deleteReview(reviewId: number): Promise<boolean> {
    await this._request(`/reviews/v1/${reviewId}/`, { method: "DELETE" });
    return true;
  }

  async likeReview(
    reviewId: number,
    isActive: boolean = true,
  ): Promise<boolean> {
    await this._request(
      `/reviews/v1/${reviewId}/like/`,
      {
        method: "PATCH",
        body: JSON.stringify({ is_active: isActive }),
      },
      true,
    );
    return true;
  }

  async unlikeReview(reviewId: number): Promise<boolean> {
    return await this.likeReview(reviewId, false);
  }

  /**@private */
  private async _request<T>(
    path: string,
    options: RequestInit = {},
    forceToken: boolean | undefined = void 0,
    getRaw = false,
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    const headers = new Headers(options.headers);

    if (this.config.userAgent) {
      headers.set("User-Agent", this.config.userAgent);
    }

    const method = options.method?.toUpperCase() ?? "GET";
    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
    const isVideo = path.includes("/video/");
    const isCommunity =
      path.includes("/reviews/") || path.includes("/comments/");

    if (
      this.config.token &&
      forceToken !== false &&
      (isMutation || isVideo || isCommunity)
    ) {
      headers.set("Authorization", `Token ${this.config.token}`);
    }

    headers.set("Content-Type", "application/json");

    const response = await fetch(url, { ...options, headers });
    if (getRaw) return response as T;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      const text = await response.text();
      throw new Error(
        `WTF (possibly geo-restricted)\nStatus: ${response.status}\nBody: ${text}`,
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // TODO: Error 객체 대신 LaftelError 아래에 또 따로 만들기
      if (errorData.code === "BLOCKED_BY_DISALLOWED_ACCESS") {
        throw new Error(
          "Geo-blocked: Content is not available outside of South Korea",
        );
      }
      if (errorData.code === "PLAYBACK_EXPIRED") {
        throw new Error("Playback expired: The playback session has timed out");
      }

      throw new Error(
        `Request failed: ${response.status} ${response.statusText}\nEndpoint: ${path}\nResponse: ${JSON.stringify(errorData, null, 2)}`,
      ); // json 아니면 인생 망함
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }
}
