import * as Raw from "../types/raw.ts";
import * as Models from "../types/models.ts";
import * as Mappers from "./mapper.ts";
import { v } from "../version.ts";

export interface ClientConfig {
  baseUrl?: string;
  token?: string;
  userAgent?: string;
}

export class LaftelClient {
  private config: Required<ClientConfig>;

  constructor(config: ClientConfig = {}) {
    if (!config) config = {};
    if (config.token?.startsWith("Token "))
      config.token = config.token.substring(6);

    this.config = {
      baseUrl: config.baseUrl ?? "https://api.laftel.net/api",
      token: config.token ?? "",
      userAgent:
        config.userAgent ??
        `LaftelTS/${v} +https://github.com/bsdrop/laftel-ts`,
    };
  }

  setToken(token: string) {
    return (this.config.token = token);
  }

  setUserAgent(ua: string) {
    this.config.userAgent = ua;
  }

  async login(email: string, password: string): Promise<false | string> {
    // return string vs user (is_adult, 등등 다 담아서 유용할거임)
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

  async getRecentVideo(animeId: number): Promise<Models.StreamInfo | null> {
    const res = await this._request<Raw.EpisodesV1IDRecentVideo>(
      `/episodes/v1/${animeId}/recent-video/`,
    );
    if ("code" in res) return null;
    return Mappers.mapStreamInfo(res);
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
  getStreamingInfo = this.getVideoStream;

  /** 재생 상태를 업데이트합니다.
   * @param {number} playLogId - getVideoStream을 통해 얻은 재생 로그 ID
   * @param {Object} status - 업데이트할 재생 상태 객체 (playtime, offset 형식: HH:MM:SS; 기본값: 00:00:00)
   */
  async updatePlayback(
    playLogId: number,
    status: {
      playtime?: string;
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
              total_play_time: status?.playtime ?? "00:00:00",
              play_end_offset: status?.offset ?? "00:00:00",
              is_player_exit: status?.exited ?? true,
              is_player_paused: status?.paused ?? true,
            }),
          },
          true,
          true,
        )
      ).status === 200
    );
  }

  async getAutocomplete(keyword: string): Promise<string[]> {
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
  getSearch = this.search;

  async getComments(
    episodeId: number,
    options: {
      limit?: number;
      cursor?: Base64URLString; // TODO: FIXME: URL 아닌데요
      sorting?: "top" | "oldest";
      mine?: boolean; // TODO: FIXME
    } = {},
  ): Promise<Models.Paginated<Models.Comment>> {
    /* TODO: FIXME 와 이색긴 previous도 주네 심지어 커서는 왜이지랄임
    o, p, r = 오ㅃr(?)
    > atob("cD0xLjc5OTk5OTk5OTk5OTk5OTg")
    "p=1.7999999999999998"
    > atob("cD0xLjc5OTk5OTk5OTk5OTk5OTg=")
    "p=1.7999999999999998"
    > atob("bz0yJnI9MSZwPTAuMA==")
    "o=2&r=1&p=0.0"
    > atob("bz0yJnA9MS42")
    "o=2&p=1.6"
    > atob("cD0zLjA=")
    "p=3.0"
    > atob("bz0xMCZwPTAuNA==")
    "o=10&p=0.4"
    > atob("bz0yMCZwPTAuNA==")
    "o=20&p=0.4"
    > atob("cj0xJnA9MC4w")
    "r=1&p=0.0"
    > atob("cD0wLjQ=")
    "p=0.4"
    > atob("cD0xLjI=")
    "p=1.2"
    > atob("cj0xJnA9MC43Mg==")
    "r=1&p=0.72"
    > atob("bz0xJnA9My41OTk5OTk5OTk5OTk5OTk2")
    "o=1&p=3.5999999999999996"
    */
    const { limit = 10, sorting = "top", mine = false } = options;
    const res = await this._request<Raw.CommentsV1List>(
      `/comments/v1/list/?episode_id=${episodeId}&limit=${limit}&sorting=${sorting}`,
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
  ): Promise<boolean> {
    const res = await this._request<Response>(
      "/comments/v1/list/",
      {
        method: "POST",
        body: JSON.stringify({
          episode: episodeId,
          content,
          is_spoiler: options.isSpoiler ?? false,
          parent_comment: options.parentId,
        }),
      },
      true,
      true,
    );
    if (res.status !== 201) return false;
    return true;
  }

  async editComment(
    commentId: number,
    content: string,
    isSpoiler: boolean,
  ): Promise<Models.Comment | false> {
    const res = await this._request<Raw.CommentItem>(
      `/comments/v1/${commentId}/`,
      {
        method: "PATCH",
        body: JSON.stringify({
          content,
          is_spoiler: isSpoiler ?? false, // FIXME
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

  /** @returns likeComment(commentId, false) */
  unlikeComment(commentId: number): Promise<boolean> {
    return this.likeComment(commentId, false);
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
    >( // TODO: FIXME: confirm
      `/reviews/v1/list/?item_id=${animeId}&limit=${limit}&offset=${offset}&sorting=${sorting}`,
    );
    return {
      total: res.count ?? 0,
      items: (res.results ?? []).map(Mappers.mapInteraction) as Models.Review[],
      next: (res.next as string | null) ?? undefined,
    };
  }

  async addReview(
    animeId: number,
    score: number,
    content: string = "",
    isSpoiler: boolean = false,
  ): Promise<Models.Review | false> {
    if (!(score % 0.5)) return false;
    if (score > 5) return false;
    if (score < 0) return false;
    const res = await this._request<Raw.ReviewsV1MyReview>(
      "/reviews/v1/list/",
      {
        method: "POST",
        body: JSON.stringify({
          item: animeId,
          content: content ?? "",
          score,
          is_spoiler: isSpoiler,
        }),
      },
    ); // TODO: FIXME: 아닐거같음
    return Mappers.mapInteraction(res) as Models.Review;
  }

  async editReview(
    reviewId: number,
    score: number,
    content: string,
    isSpoiler?: boolean,
  ): Promise<boolean> {
    const res = await this._request<Response>(
      `/reviews/v1/${reviewId}/`,
      {
        method: "PATCH",
        body: JSON.stringify({
          score,
          content,
          is_spoiler: isSpoiler ?? false,
        }),
      },
      true,
      true,
    );
    return res.status === 200;
  }

  async deleteReview(reviewId: number): Promise<boolean> {
    return (
      (
        await this._request<Response>(
          `/reviews/v1/${reviewId}/`,
          { method: "DELETE" },
          true,
          true,
        )
      ).status === 204
    );
  }

  async likeReview(
    reviewId: number,
    isActive: boolean = true,
  ): Promise<boolean> {
    return (
      (
        await this._request<Response>(
          `/reviews/v1/${reviewId}/like/`,
          {
            method: "PATCH",
            body: JSON.stringify({ is_active: isActive }),
          },
          true,
          true,
        )
      ).status === 200
    );
  }

  async unlikeReview(reviewId: number): Promise<boolean> {
    return await this.likeReview(reviewId, false);
  }

  async getBannedWord(): Promise<string[] | false> {
    let res = await this._request<Response>("/users/v1/banned_words/", {
      method: "GET",
    });
    if (!res.ok) return false;
    return (
      ((await res.json()) as Raw.UsersV1BannedWords).banned_word_list || false
    );
  }

  /** 모든 기기에서 로그아웃합니다. (세션 키를 초기화합니다.) */
  async forceLogout(): Promise<boolean> {
    if (!this.config.token) return false;
    let res = await this._request<Response>(
      "/profiles/v1/force_logout",
      { method: "POST" },
      true,
      true,
    );
    if (res.status === 204) return true;
    return false;
  }
  logoutAllDevices = this.forceLogout;
  revokeAllSessions = this.forceLogout;

  async getCardList(): Promise<Raw.BillingInfo[] | false> {
    return (
      (await this._request<Raw.BillingInfo[]>(
        "/api/billing/v1/info/",
        undefined,
        true,
      )) ?? false
    );
  }

  /** if(await removeCard(123456) === true) console.log("Success"); else console.log("Failed (Response is Raw Response)")
   * @param id Raw.BillingInfo.id */
  async removeCard(id: number): Promise<true | Response> {
    let res = await this._request<Response>(
      `/api/billing/v1/nicepay/${parseInt(id as any)}`,
      {
        method: "DELETE",
      },
    );
    if (res.status === 204) return true;
    else return (console.debug(res), res);
  } /** removeCard() */
  deleteCard = this.removeCard;

  async addCard(payload: {
    cardNumber: string | number; // TODO: JSDoc maybv
    expMonth: Raw.from0to12;
    expYear: Raw.from0to99;
    birth: string;
    pwd: Raw.from0to99;
  }): Promise<Raw.BillingInfo | string> {
    // TODO: FIXME: 존나더러운건 둘째치고 에러를 하나하나씩 체크해서 유저 입장에서도 좆같음.
    if (!payload || typeof payload != "object")
      return "페이로드가 입력되지 않았습니다.";
    let cardNumber = payload.cardNumber?.toString();
    if (this._checkCard(cardNumber)) return "카드 번호 오류";
    cardNumber = cardNumber.toString().replace(/\D/g, "");

    if (payload.birth?.toString()?.length === 8)
      payload.birth = payload.birth.toString().substring(2, 8);
    if (payload.birth?.toString()?.length !== 6)
      return "생년월일은 6자리여야 합니다. (YYMMDD)";
    let fucked = false;
    try {
      new Date(
        `20${payload.birth[0]}${payload.birth[1]}-${payload.birth[2]}${payload.birth[3]}-${payload.birth[4]}${payload.birth[5]}T00:00:00.000Z`,
      );
    } catch {
      fucked = true;
      try {
        new Date(
          `19${payload.birth[0]}${payload.birth[1]}-${payload.birth[2]}${payload.birth[3]}-${payload.birth[4]}${payload.birth[5]}T00:00:00.000Z`,
        );
        fucked = false;
      } catch {}
    }
    if (fucked) return "잘못된 생년월일입니다.";
    let expMonth = parseInt((payload.expMonth || 0) as any);
    if (expMonth <= 0 || expMonth > 12)
      return "카드 만료 기간이 유효하지 않습니다.";

    if (payload.expYear?.toString().length == 4) {
      if (payload.expYear.toString().startsWith("20")) {
        payload.expYear = payload.expYear
          .toString()
          .substring(2, 4) as Raw.from0to99;
      } else if (payload.expYear.toString().startsWith("2"))
        return "더 이상은 이 SDK를 사용할 수 없습니다.";
    }
    if (
      payload?.expYear.toString().length !== 2 ||
      parseInt(payload.expYear as any) < new Date().getFullYear() - 2000
      /*![2, 4].includes(payload?.expYear.toString().length) ||
      payload.expYear?.toString().length - 2
        ? parseInt(payload.expYear) < new Date().getFullYear() - 2000
        : parseInt(payload.expYear) < new Date().getFullYear()*/
    )
      return "카드 만료 년도가 유효하지 않습니다.";

    let pwd;
    if (typeof payload?.pwd === "number") {
      pwd = payload.pwd.toString();
      if (pwd.length == 1) pwd = `0${pwd}`.substring(0, 2);
      else if (pwd.length > 2)
        return "카드 비밀번호 앞 2자리를 string으로 입력하십시오.";
    } else if (typeof payload?.pwd === "string") pwd = payload.pwd;
    if (!pwd) return "카드 비밀번호가 유효하지 않습니다.";
    if (pwd.length == 4) pwd = pwd.substring(0, 2);
    if (pwd.length !== 2)
      return pwd.length == 6
        ? "결제 비밀번호로 잘못 입력하신 것 같습니다. 카드 비밀번호 앞 두자리를 입력하여 주세요."
        : "카드 비밀번호가 유효하지 않습니다.";

    return "구현되지 않았습니다.";
    let res = await this._request<Response>(
      "/billing/v1/nicepay/",
      { method: "POST", body: undefined },
      true,
      true,
    );
    if (res.status !== 201) return `좆망했습니다.\n${res}\n${await res.text()}`; // json.code ?? json.detail ?? json.msg
    ({
      url: "https://api.laftel.net/api/billing/v1/nicepay/",
      method: "POST",
      status: 201,
      req: {
        billing_type: "card",
        card_number: "",
        expiration_year: "",
        expiration_month: "",
        birth: "",
        pwd_2digit: "",
      },
      res: {
        msg: "빌키가 정상적으로 생성되었습니다.",
        data: {
          id: 123456,
          created: "2026-02-06T19:26:37.855329",
          modified: "2026-02-06T19:26:37.855329",
          pg_type: "nicepay",
          billing_type: "card",
          card_name: "신한",
          card_number: "7835",
          phone_number: null,
          is_svod_billing_info: false,
        },
      },
    });
  }

  /** 결제 비밀번호를 초기화하게 되면 보안상의 이유로 카드도 모두 삭제됨 */
  async resetPayPassword(): Promise<boolean> {
    return (
      (
        await this._request<Response>(
          "/billing/v1/password/",
          { method: "DELETE" },
          true,
          true,
        )
      ).status === 204
    );
  }

  /** 결제 비밀번호를 초기화함으로써 등록된 카드도 모두 삭제함
   * @alias resetPayPassword */ deleteCards = this.resetPayPassword;
  /** 결제 비밀번호를 초기화함으로써 등록된 카드도 모두 삭제함
   * @alias resetPayPassword */ removeCards = this.resetPayPassword;

  /** @private */
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
      const errorData = await response
        .json()
        .catch((any) => (console.debug(any), {}));
      // TODO: LaftelError
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
      );
    }

    if (response.status === 204) {
      return {} as T; // FIXME
    }

    return response.json();
  }

  /** @private */
  private _checkCard(number: string): boolean {
    number = number.toString().replace(/\D/g, "");
    if (number.length !== 16) return false; // amex?

    let s = 0,
      d = false;
    for (let i = number.length - 1; i >= 0; i--) {
      let j = parseInt(number[i]);
      if (d) {
        j *= 2;
        if (j > 9) j -= 9;
      }
      ((s += j), (d = !d));
    }
    if (s % 10 !== 0) return false;
    return true;
  }
}
