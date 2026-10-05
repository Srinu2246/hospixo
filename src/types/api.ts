export type ApiResponse<T> = Readonly<{
  success: boolean;
  data: T | null;
  message: string;
  request_id?: string;
}>;

export type ApiValidationDetailItem = Readonly<{
  loc: ReadonlyArray<string | number>;
  msg: string;
  type: string;
  input?: unknown;
}>;

export type ApiErrorCodeDetail = Readonly<{
  code?: string;
  message?: string;
}>;

export type StructuredApiErrorDetail = ApiErrorCodeDetail &
  Readonly<{
    details?: ReadonlyArray<{
      field?: string;
      reason?: string;
      msg?: string;
      message?: string;
    }>;
  }>;

export type ApiErrorDetail =
  string | ReadonlyArray<ApiValidationDetailItem> | StructuredApiErrorDetail;

export type ApiErrorPayload = Readonly<{
  message?: string;
  detail?: ApiErrorDetail;
  /** Some platform endpoints use `details` instead of `detail`. */
  details?: ApiErrorCodeDetail | StructuredApiErrorDetail;
  code?: string;
  type?: string;
}>;
