export interface NestResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
