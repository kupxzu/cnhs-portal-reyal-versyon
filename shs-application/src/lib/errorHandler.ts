import toast from 'react-hot-toast';

export interface ApiError {
  status: number;
  message: string;
  data?: any;
}

export const handleApiError = (error: any): ApiError => {
  let apiError: ApiError = {
    status: 500,
    message: 'An unexpected error occurred',
  };

  if (error.response) {
    // Server responded with error status
    apiError.status = error.response.status;
    
    switch (error.response.status) {
      case 400:
        apiError.message = error.response.data?.message || 'Bad request. Please check your input.';
        break;
      case 401:
        apiError.message = error.response.data?.message || 'Unauthorized. Please log in again.';
        // Clear auth and redirect to login
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        break;
      case 403:
        apiError.message = error.response.data?.message || 'You do not have permission to access this resource.';
        break;
      case 404:
        apiError.message = error.response.data?.message || 'Resource not found.';
        break;
      case 422:
        apiError.message = error.response.data?.message || 'Validation error. Please check your input.';
        apiError.data = error.response.data?.errors;
        break;
      case 429:
        apiError.message = 'Too many requests. Please try again later.';
        break;
      case 500:
        apiError.message = 'Server error. Please try again later.';
        break;
      case 503:
        apiError.message = 'Service temporarily unavailable. Please try again later.';
        break;
      default:
        apiError.message = error.response.data?.message || `Error (${error.response.status}). Please try again.`;
    }
  } else if (error.request) {
    // Request made but no response received
    apiError.message = 'No response from server. Please check your connection.';
  } else {
    // Error in request setup
    apiError.message = error.message || 'An error occurred while making the request.';
  }

  return apiError;
};

export const showErrorToast = (error: any) => {
  const apiError = handleApiError(error);
  toast.error(apiError.message);
  return apiError;
};

export const showSuccessToast = (message: string) => {
  toast.success(message);
};
