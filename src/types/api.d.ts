export interface ResponseData<T = any> {
  code: number;
  success: boolean;
  message: string;
  data: T;
}
