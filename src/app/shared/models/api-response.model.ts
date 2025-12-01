export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: ValidationError[];
  timestamp: string;
}
