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

/**
 * * `active` - Действует
 * * `deleted` - Удалён
 */
export enum ServiceStatusEnum {
  Active = 'active',
  Deleted = 'deleted',
}

/**
 * * `draft` - Черновик
 * * `deleted` - Удалён
 * * `formed` - Сформирован
 * * `completed` - Завершён
 * * `rejected` - Отклонён
 */
export enum OrderStatusEnum {
  Draft = 'draft',
  Deleted = 'deleted',
  Formed = 'formed',
  Completed = 'completed',
  Rejected = 'rejected',
}

export interface Order {
  /**
   * ID заявки
   * @min -2147483648
   * @max 2147483647
   */
  id: number;
  /** Статус */
  status: OrderStatusEnum;
  status_display: string;
  creator: User;
  /**
   * Дата создания
   * @format date-time
   */
  created_at: string;
  /**
   * Дата формирования
   * @format date-time
   */
  formed_at: string | null;
  /**
   * Дата завершения
   * @format date-time
   */
  completed_at: string | null;
  /** Модератор */
  moderator: number | null;
  /**
   * Итого
   * @format decimal
   * @pattern ^-?\d{0,8}(?:\.\d{0,2})?$
   */
  total: string;
  /** Количество услуг */
  items_count: number;
  /** Комментарий */
  comment?: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  /**
   * Заявка
   * @min -2147483648
   * @max 2147483647
   */
  order: number;
  service: Service;
  service_id: number;
  /**
   * Количество
   * @min -2147483648
   * @max 2147483647
   */
  quantity?: number;
  /**
   * Позиция
   * @min -2147483648
   * @max 2147483647
   */
  position?: number;
  /** Главная услуга */
  is_main?: boolean;
  /**
   * Подытог
   * @format decimal
   * @pattern ^-?\d{0,8}(?:\.\d{0,2})?$
   */
  subtotal: string;
}

export interface OrderItemRequest {
  /**
   * Количество
   * @min -2147483648
   * @max 2147483647
   */
  quantity?: number;
  /**
   * Позиция
   * @min -2147483648
   * @max 2147483647
   */
  position?: number;
  /** Главная услуга */
  is_main?: boolean;
}

export interface OrderRequest {
  /**
   * ID заявки
   * @min -2147483648
   * @max 2147483647
   */
  id: number;
  /** Комментарий */
  comment?: string;
}

export interface PatchedOrderRequest {
  /**
   * ID заявки
   * @min -2147483648
   * @max 2147483647
   */
  id?: number;
  /** Комментарий */
  comment?: string;
}

export interface PatchedServiceRequest {
  /**
   * @min -2147483648
   * @max 2147483647
   */
  id?: number;
  /**
   * Наименование
   * @minLength 1
   * @maxLength 200
   */
  name?: string;
  /**
   * Описание
   * @minLength 1
   */
  description?: string;
  /**
   * Цена
   * @format decimal
   * @pattern ^-?\d{0,8}(?:\.\d{0,2})?$
   */
  price?: string;
  /** Статус */
  status?: ServiceStatusEnum;
  /**
   * Ключ изображения
   * @maxLength 100
   */
  image_key?: string | null;
  /**
   * Ключ видео
   * @maxLength 100
   */
  video_key?: string | null;
  /**
   * Доп. фото 2
   * @maxLength 100
   */
  image_key_2?: string | null;
  /**
   * Доп. фото 3
   * @maxLength 100
   */
  image_key_3?: string | null;
  /**
   * Доп. фото 4
   * @maxLength 100
   */
  image_key_4?: string | null;
  /**
   * Доп. фото 5
   * @maxLength 100
   */
  image_key_5?: string | null;
  /**
   * Категория
   * @minLength 1
   * @maxLength 50
   */
  category?: string;
  /**
   * Производитель
   * @maxLength 100
   */
  manufacturer?: string;
  /** @format binary */
  image?: File;
  /** @format binary */
  video?: File;
}

export interface PatchedUserProfileRequest {
  /**
   * Телефон
   * @maxLength 20
   */
  phone?: string;
  /**
   * Компания
   * @maxLength 100
   */
  company?: string;
  /**
   * Должность
   * @maxLength 100
   */
  position?: string;
}

export interface Service {
  /**
   * @min -2147483648
   * @max 2147483647
   */
  id: number;
  /**
   * Наименование
   * @maxLength 200
   */
  name: string;
  /** Описание */
  description: string;
  /**
   * Цена
   * @format decimal
   * @pattern ^-?\d{0,8}(?:\.\d{0,2})?$
   */
  price: string;
  /** Статус */
  status?: ServiceStatusEnum;
  /**
   * Ключ изображения
   * @maxLength 100
   */
  image_key?: string | null;
  /**
   * Ключ видео
   * @maxLength 100
   */
  video_key?: string | null;
  /**
   * Доп. фото 2
   * @maxLength 100
   */
  image_key_2?: string | null;
  /**
   * Доп. фото 3
   * @maxLength 100
   */
  image_key_3?: string | null;
  /**
   * Доп. фото 4
   * @maxLength 100
   */
  image_key_4?: string | null;
  /**
   * Доп. фото 5
   * @maxLength 100
   */
  image_key_5?: string | null;
  /**
   * Категория
   * @maxLength 50
   */
  category: string;
  /**
   * Производитель
   * @maxLength 100
   */
  manufacturer?: string;
  /**
   * Дата создания
   * @format date-time
   */
  created_at: string;
  /**
   * Дата обновления
   * @format date-time
   */
  updated_at: string;
}

export interface ServiceRequest {
  /**
   * @min -2147483648
   * @max 2147483647
   */
  id: number;
  /**
   * Наименование
   * @minLength 1
   * @maxLength 200
   */
  name: string;
  /**
   * Описание
   * @minLength 1
   */
  description: string;
  /**
   * Цена
   * @format decimal
   * @pattern ^-?\d{0,8}(?:\.\d{0,2})?$
   */
  price: string;
  /** Статус */
  status?: ServiceStatusEnum;
  /**
   * Ключ изображения
   * @maxLength 100
   */
  image_key?: string | null;
  /**
   * Ключ видео
   * @maxLength 100
   */
  video_key?: string | null;
  /**
   * Доп. фото 2
   * @maxLength 100
   */
  image_key_2?: string | null;
  /**
   * Доп. фото 3
   * @maxLength 100
   */
  image_key_3?: string | null;
  /**
   * Доп. фото 4
   * @maxLength 100
   */
  image_key_4?: string | null;
  /**
   * Доп. фото 5
   * @maxLength 100
   */
  image_key_5?: string | null;
  /**
   * Категория
   * @minLength 1
   * @maxLength 50
   */
  category: string;
  /**
   * Производитель
   * @maxLength 100
   */
  manufacturer?: string;
  /** @format binary */
  image?: File;
  /** @format binary */
  video?: File;
}

export interface User {
  id: number;
  /**
   * Имя пользователя
   * Обязательное поле. Не более 150 символов. Только буквы, цифры и символы @/./+/-/_.
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username: string;
  /**
   * Адрес электронной почты
   * @format email
   * @maxLength 254
   */
  email?: string;
  /**
   * Имя
   * @maxLength 150
   */
  first_name?: string;
  /**
   * Фамилия
   * @maxLength 150
   */
  last_name?: string;
}

export interface UserProfile {
  id: number;
  user: User;
  /**
   * Телефон
   * @maxLength 20
   */
  phone?: string;
  /**
   * Компания
   * @maxLength 100
   */
  company?: string;
  /**
   * Должность
   * @maxLength 100
   */
  position?: string;
  /**
   * Дата регистрации
   * @format date-time
   */
  created_at: string;
}

export interface UserProfileRequest {
  /**
   * Телефон
   * @maxLength 20
   */
  phone?: string;
  /**
   * Компания
   * @maxLength 100
   */
  company?: string;
  /**
   * Должность
   * @maxLength 100
   */
  position?: string;
}

export interface UserRequest {
  /**
   * Имя пользователя
   * Обязательное поле. Не более 150 символов. Только буквы, цифры и символы @/./+/-/_.
   * @minLength 1
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username: string;
  /**
   * Адрес электронной почты
   * @format email
   * @maxLength 254
   */
  email?: string;
  /**
   * Имя
   * @maxLength 150
   */
  first_name?: string;
  /**
   * Фамилия
   * @maxLength 150
   */
  last_name?: string;
}

import type { AxiosInstance, AxiosRequestConfig, HeadersDefaults, ResponseType } from 'axios';
import axios from 'axios';

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<
  AxiosRequestConfig,
  'data' | 'params' | 'url' | 'responseType'
> {
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

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<
  AxiosRequestConfig,
  'data' | 'cancelToken'
> {
  securityWorker?: (
    securityData: SecurityDataType | null
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = 'application/json',
  JsonApi = 'application/vnd.api+json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
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
      baseURL: axiosConfig.baseURL || '',
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
    params2?: AxiosRequestConfig
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === 'object' && formItem !== null) {
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
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
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
  }: FullRequestParams): Promise<T> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === 'object') {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== 'string') {
      body = JSON.stringify(body);
    }

    return this.instance
      .request({
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type ? { 'Content-Type': type } : {}),
        },
        params: query,
        responseType: responseFormat,
        data: body,
        url: path,
      })
      .then((response) => response.data);
  };
}

/**
 * @title DJI Lab API
 * @version 1.0.0
 *
 * API для системы заказа лабораторного оборудования
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags orders
     * @name OrdersList
     * @request GET:/api/orders/
     * @secure
     */
    ordersList: (params: RequestParams = {}) =>
      this.request<Order[], any>({
        path: `/api/orders/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags orders
     * @name OrdersCreate
     * @request POST:/api/orders/
     * @secure
     */
    ordersCreate: (data: OrderRequest, params: RequestParams = {}) =>
      this.request<Order, any>({
        path: `/api/orders/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags orders
     * @name OrdersRetrieve
     * @request GET:/api/orders/{id}/
     * @secure
     */
    ordersRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<Order, any>({
        path: `/api/orders/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags orders
     * @name OrdersUpdate
     * @request PUT:/api/orders/{id}/
     * @secure
     */
    ordersUpdate: (id: string, data: OrderRequest, params: RequestParams = {}) =>
      this.request<Order, any>({
        path: `/api/orders/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description PATCH /api/orders/{id}/ - Создатель: любые поля (кроме статуса) - Модератор: comment ИЛИ status
     *
     * @tags orders
     * @name OrdersPartialUpdate
     * @request PATCH:/api/orders/{id}/
     * @secure
     */
    ordersPartialUpdate: (id: string, data: PatchedOrderRequest, params: RequestParams = {}) =>
      this.request<Order, any>({
        path: `/api/orders/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags orders
     * @name OrdersDestroy
     * @request DELETE:/api/orders/{id}/
     * @secure
     */
    ordersDestroy: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/orders/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags orders
     * @name OrdersCompleteUpdate
     * @request PUT:/api/orders/{id}/complete/
     * @secure
     */
    ordersCompleteUpdate: (id: string, data: OrderRequest, params: RequestParams = {}) =>
      this.request<Order, any>({
        path: `/api/orders/${id}/complete/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags orders
     * @name OrdersDeleteCreate
     * @request POST:/api/orders/{id}/delete/
     * @secure
     */
    ordersDeleteCreate: (id: string, data: OrderRequest, params: RequestParams = {}) =>
      this.request<Order, any>({
        path: `/api/orders/${id}/delete/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags orders
     * @name OrdersFormUpdate
     * @request PUT:/api/orders/{id}/form/
     * @secure
     */
    ordersFormUpdate: (id: string, data: OrderRequest, params: RequestParams = {}) =>
      this.request<Order, any>({
        path: `/api/orders/${id}/form/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags orders
     * @name OrdersItemsDestroy
     * @request DELETE:/api/orders/{id}/items/{service_id}/
     * @secure
     */
    ordersItemsDestroy: (id: string, serviceId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/orders/${id}/items/${serviceId}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags orders
     * @name OrdersRemoveItemCreate
     * @request POST:/api/orders/{id}/remove_item/
     * @secure
     */
    ordersRemoveItemCreate: (id: string, data: OrderRequest, params: RequestParams = {}) =>
      this.request<Order, any>({
        path: `/api/orders/${id}/remove_item/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags orders
     * @name OrdersUpdateItemUpdate
     * @request PUT:/api/orders/{id}/update_item/
     * @secure
     */
    ordersUpdateItemUpdate: (id: string, data: OrderRequest, params: RequestParams = {}) =>
      this.request<Order, any>({
        path: `/api/orders/${id}/update_item/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags orders
     * @name OrdersUpdateItemLegacyCreate
     * @request POST:/api/orders/{id}/update_item_legacy/
     * @secure
     */
    ordersUpdateItemLegacyCreate: (id: string, data: OrderRequest, params: RequestParams = {}) =>
      this.request<Order, any>({
        path: `/api/orders/${id}/update_item_legacy/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags orders
     * @name OrdersCartIconRetrieve
     * @request GET:/api/orders/cart_icon/
     * @secure
     */
    ordersCartIconRetrieve: (params: RequestParams = {}) =>
      this.request<Order, any>({
        path: `/api/orders/cart_icon/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags profiles
     * @name ProfilesList
     * @request GET:/api/profiles/
     * @secure
     */
    profilesList: (params: RequestParams = {}) =>
      this.request<UserProfile[], any>({
        path: `/api/profiles/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags profiles
     * @name ProfilesCreate
     * @request POST:/api/profiles/
     * @secure
     */
    profilesCreate: (data: UserProfileRequest, params: RequestParams = {}) =>
      this.request<UserProfile, any>({
        path: `/api/profiles/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags profiles
     * @name ProfilesRetrieve
     * @request GET:/api/profiles/{id}/
     * @secure
     */
    profilesRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<UserProfile, any>({
        path: `/api/profiles/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags profiles
     * @name ProfilesUpdate
     * @request PUT:/api/profiles/{id}/
     * @secure
     */
    profilesUpdate: (id: number, data: UserProfileRequest, params: RequestParams = {}) =>
      this.request<UserProfile, any>({
        path: `/api/profiles/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags profiles
     * @name ProfilesPartialUpdate
     * @request PATCH:/api/profiles/{id}/
     * @secure
     */
    profilesPartialUpdate: (
      id: number,
      data: PatchedUserProfileRequest,
      params: RequestParams = {}
    ) =>
      this.request<UserProfile, any>({
        path: `/api/profiles/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags profiles
     * @name ProfilesDestroy
     * @request DELETE:/api/profiles/{id}/
     * @secure
     */
    profilesDestroy: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/profiles/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags profiles
     * @name ProfilesLoginCreate
     * @request POST:/api/profiles/login/
     * @secure
     */
    profilesLoginCreate: (data: UserProfileRequest, params: RequestParams = {}) =>
      this.request<UserProfile, any>({
        path: `/api/profiles/login/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags profiles
     * @name ProfilesLogoutCreate
     * @request POST:/api/profiles/logout/
     * @secure
     */
    profilesLogoutCreate: (data: UserProfileRequest, params: RequestParams = {}) =>
      this.request<UserProfile, any>({
        path: `/api/profiles/logout/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags profiles
     * @name ProfilesMeRetrieve
     * @request GET:/api/profiles/me/
     * @secure
     */
    profilesMeRetrieve: (params: RequestParams = {}) =>
      this.request<UserProfile, any>({
        path: `/api/profiles/me/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags profiles
     * @name ProfilesRegisterCreate
     * @request POST:/api/profiles/register/
     * @secure
     */
    profilesRegisterCreate: (data: UserProfileRequest, params: RequestParams = {}) =>
      this.request<UserProfile, any>({
        path: `/api/profiles/register/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description OpenApi3 schema for this API. Format can be selected via content negotiation. - YAML: application/vnd.oai.openapi - JSON: application/vnd.oai.openapi+json
     *
     * @tags schema
     * @name SchemaRetrieve
     * @request GET:/api/schema/
     * @secure
     */
    schemaRetrieve: (
      query?: {
        format?: 'json' | 'yaml';
        lang?:
          | 'af'
          | 'ar'
          | 'ar-dz'
          | 'ast'
          | 'az'
          | 'be'
          | 'bg'
          | 'bn'
          | 'br'
          | 'bs'
          | 'ca'
          | 'ckb'
          | 'cs'
          | 'cy'
          | 'da'
          | 'de'
          | 'dsb'
          | 'el'
          | 'en'
          | 'en-au'
          | 'en-gb'
          | 'eo'
          | 'es'
          | 'es-ar'
          | 'es-co'
          | 'es-mx'
          | 'es-ni'
          | 'es-ve'
          | 'et'
          | 'eu'
          | 'fa'
          | 'fi'
          | 'fr'
          | 'fy'
          | 'ga'
          | 'gd'
          | 'gl'
          | 'he'
          | 'hi'
          | 'hr'
          | 'hsb'
          | 'hu'
          | 'hy'
          | 'ia'
          | 'id'
          | 'ig'
          | 'io'
          | 'is'
          | 'it'
          | 'ja'
          | 'ka'
          | 'kab'
          | 'kk'
          | 'km'
          | 'kn'
          | 'ko'
          | 'ky'
          | 'lb'
          | 'lt'
          | 'lv'
          | 'mk'
          | 'ml'
          | 'mn'
          | 'mr'
          | 'ms'
          | 'my'
          | 'nb'
          | 'ne'
          | 'nl'
          | 'nn'
          | 'os'
          | 'pa'
          | 'pl'
          | 'pt'
          | 'pt-br'
          | 'ro'
          | 'ru'
          | 'sk'
          | 'sl'
          | 'sq'
          | 'sr'
          | 'sr-latn'
          | 'sv'
          | 'sw'
          | 'ta'
          | 'te'
          | 'tg'
          | 'th'
          | 'tk'
          | 'tr'
          | 'tt'
          | 'udm'
          | 'ug'
          | 'uk'
          | 'ur'
          | 'uz'
          | 'vi'
          | 'zh-hans'
          | 'zh-hant';
      },
      params: RequestParams = {}
    ) =>
      this.request<Record<string, any>, any>({
        path: `/api/schema/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Переопределяем list для добавления кэширования.
     *
     * @tags services
     * @name ServicesList
     * @request GET:/api/services/
     * @secure
     */
    servicesList: (
      query?: {
        /** Which field to use when ordering the results. */
        ordering?: string;
        /** A search term. */
        search?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<Service[], any>({
        path: `/api/services/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Создание услуги с инвалидацией кэша.
     *
     * @tags services
     * @name ServicesCreate
     * @request POST:/api/services/
     * @secure
     */
    servicesCreate: (data: ServiceRequest, params: RequestParams = {}) =>
      this.request<Service, any>({
        path: `/api/services/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags services
     * @name ServicesRetrieve
     * @request GET:/api/services/{id}/
     * @secure
     */
    servicesRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<Service, any>({
        path: `/api/services/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Обновление услуги с инвалидацией кэша.
     *
     * @tags services
     * @name ServicesUpdate
     * @request PUT:/api/services/{id}/
     * @secure
     */
    servicesUpdate: (id: number, data: ServiceRequest, params: RequestParams = {}) =>
      this.request<Service, any>({
        path: `/api/services/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags services
     * @name ServicesPartialUpdate
     * @request PATCH:/api/services/{id}/
     * @secure
     */
    servicesPartialUpdate: (id: number, data: PatchedServiceRequest, params: RequestParams = {}) =>
      this.request<Service, any>({
        path: `/api/services/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Удаление услуги с инвалидацией кэша.
     *
     * @tags services
     * @name ServicesDestroy
     * @request DELETE:/api/services/{id}/
     * @secure
     */
    servicesDestroy: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/services/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags services
     * @name ServicesAddToOrderCreate
     * @request POST:/api/services/{id}/add_to_order/
     * @secure
     */
    servicesAddToOrderCreate: (id: number, data: ServiceRequest, params: RequestParams = {}) =>
      this.request<Service, any>({
        path: `/api/services/${id}/add_to_order/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags services
     * @name ServicesSimilarRetrieve
     * @request GET:/api/services/{id}/similar/
     * @secure
     */
    servicesSimilarRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<Service, any>({
        path: `/api/services/${id}/similar/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
}
