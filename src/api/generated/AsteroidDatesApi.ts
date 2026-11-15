/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface AsteroidDateDto {
  /** @example 2 */
  id: number;
  /** @example "2026 KJ" */
  designation: string;
  /** @example "Сближение астероида с Землёй" */
  shortDescription: string | null;
  status: "draft" | "published" | "deleted";
  /**
   * Автор из сессии, не задаётся клиентом
   * @example 1
   */
  creatorId: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  formedAt: string | null;
  /** @example "/uploads/dates/date-image.png" */
  imageUrl: string;
  /** @example "/uploads/dates/date-video.mp4" */
  videoUrl: string;
  /** @example 5 */
  approachMonth: number | null;
  /** @example 12 */
  approachDay: number | null;
  /** @example 0.023 */
  minimumDistanceAu: number | null;
  /** @example 3 */
  likesCount: number;
  /** 1, если текущий пользователь — автор; для гостя 0 */
  isCreator: 0 | 1;
  /** Лайк текущего пользователя; для гостя 0 */
  isLiked: 0 | 1;
}

export interface DateListEnvelopeDto {
  data: AsteroidDateDto[];
}

export interface DraftEnvelopeDto {
  data: AsteroidDateDto | null;
}

export interface DateEnvelopeDto {
  data: AsteroidDateDto;
}

export interface PublishDateDto {
  /**
   * @maxLength 700
   * @example "Астероид пройдёт рядом с Землёй 18 октября."
   */
  shortDescription: string;
  /**
   * @min 1
   * @max 12
   * @example 10
   */
  approachMonth: number;
  /**
   * @min 1
   * @max 31
   * @example 18
   */
  approachDay: number;
  /**
   * @min 0.00001
   * @max 999.99999
   * @example 0.023
   */
  minimumDistanceAu?: number;
}

export interface LikeDateDto {
  /**
   * 1 — поставить, 0 — снять; требуется like, liked или value
   * @example 1
   */
  like?: 0 | 1;
  /** Альтернативное имя поля like */
  liked?: 0 | 1;
  /** Альтернативное имя поля like */
  value?: 0 | 1;
}

export interface LikeDataDto {
  like: 0 | 1;
  date: AsteroidDateDto;
}

export interface LikeEnvelopeDto {
  data: LikeDataDto;
}

export interface ListPublishedDatesParams {
  /**
   * Месяц сближения не позднее указанного
   * @min 1
   * @max 12
   * @example 7
   */
  maxMonth?: number;
}

export interface GetFeedDateParams {
  /** @min 1 */
  id?: number;
  /** @example true */
  next?: boolean;
}

export interface SetLikeParams {
  /** @min 1 */
  id: number;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Asteroid Dates API — ЛР4
 * @version 2.0
 * @contact
 *
 * Даты сближения астероидов с Землёй. Список и лента доступны гостю. Зарегистрируйтесь и выполните POST /api/users/auth в Swagger: браузер сохранит cookie, после чего доступны собственный черновик, публикация, удаление и лайки.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Доступен гостю и пользователю, в том числе с неверной cookie. Черновики и удалённые записи не включаются.
     *
     * @tags Даты сближения астероидов
     * @name ListPublishedDates
     * @summary Список опубликованных дат
     * @request GET:/api/dates
     */
    listPublishedDates: (
      query: ListPublishedDatesParams = {},
      params: RequestParams = {},
    ) =>
      this.request<DateListEnvelopeDto, void>({
        path: `/api/dates`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Не более одного черновика на пользователя. Автор автоматически берётся из Redis-сессии. Картинка и видео необязательны, до 50 МБ каждый.
     *
     * @tags Даты сближения астероидов
     * @name CreateDraft
     * @summary Создать или обновить собственный черновик
     * @request POST:/api/dates
     * @secure
     */
    createDraft: (
      data: {
        /**
         * @maxLength 120
         * @example "2026 LAB4"
         */
        designation: string;
        /**
         * PNG, JPEG, GIF или WebP
         * @format binary
         */
        image?: File;
        /**
         * MP4, WebM или QuickTime
         * @format binary
         */
        video?: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<DateEnvelopeDto, void>({
        path: `/api/dates`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Без id — первая запись; с id — выбранная запись; с id и next=true — следующая по id с переходом к началу. Только опубликованные даты.
     *
     * @tags Даты сближения астероидов
     * @name GetFeedDate
     * @summary Лента астероидов
     * @request GET:/api/dates/feed
     */
    getFeedDate: (query: GetFeedDateParams = {}, params: RequestParams = {}) =>
      this.request<DateListEnvelopeDto, void>({
        path: `/api/dates/feed`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Чужие черновики недоступны. При отсутствии собственного черновика data=null.
     *
     * @tags Даты сближения астероидов
     * @name GetCurrentDraft
     * @summary Черновик текущего наблюдателя
     * @request GET:/api/dates/draft
     * @secure
     */
    getCurrentDraft: (params: RequestParams = {}) =>
      this.request<DraftEnvelopeDto, void>({
        path: `/api/dates/draft`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет описание, дату и расстояние, устанавливает status=published и formedAt. Гость получает 401.
     *
     * @tags Даты сближения астероидов
     * @name PublishDraft
     * @summary Опубликовать собственный черновик
     * @request PUT:/api/dates/publish
     * @secure
     */
    publishDraft: (data: PublishDateDto, params: RequestParams = {}) =>
      this.request<DateEnvelopeDto, void>({
        path: `/api/dates/publish`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Повторная установка лайка не создаёт дубликатов.
     *
     * @tags Даты сближения астероидов
     * @name SetLike
     * @summary Поставить или снять свой лайк
     * @request POST:/api/dates/{id}/like
     * @secure
     */
    setLike: (
      { id }: SetLikeParams,
      data: LikeDateDto,
      params: RequestParams = {},
    ) =>
      this.request<LikeEnvelopeDto, void>({
        path: `/api/dates/${id}/like`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
