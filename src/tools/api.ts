import axios, { AxiosRequestConfig, AxiosResponse, CancelToken, Method, ResponseType } from 'axios';

axios.defaults.baseURL = process.env.VUE_APP_OPENWEATHER_API_BASE_URL;
axios.defaults.headers = {
  common: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
};

export interface IAPIResponse {
  code?: number;
  data?: {
    [key: string]: unknown;
  };
  result: 'success' | 'error';
}

export interface IResponseError {
  code?: string;
  message?: string;
  title: string;
}

export interface IResponseErrorValidation {
  [key: string]: string;
}

export interface APIResponseError extends IAPIResponse {}

export interface APIResponseSuccess extends IAPIResponse {
  result: 'success';
}

export interface IAPIRequest {
  headers?: { [key: string]: any };
  method: Method;
  url: string;
  data?: {
    [key: string]: any;
  };
  params?: {
    [key: string]: any;
  };
  cancelToken?: CancelToken;
  responseType?: ResponseType;
}

export interface IHandleErrorResult {
  message: string;
}

export async function request<T>(
  { data, headers, method, params, url, cancelToken, responseType }: IAPIRequest,
  mock?: T, // Return mocked response without actually making a real request
  offline?: T, // Return mocked response if server is down or request returned an error
): Promise<T & APIResponseSuccess> {
  const requestParams: AxiosRequestConfig = {
    data,
    headers,
    method,
    params,
    url,
    cancelToken,
    responseType,
  };

  if (mock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        return resolve({ ...mock, ...{ result: 'success' } });
      }, 1000);
    });
  } else {
    try {
      const response = await axios.request(requestParams);
      return response.data;
    } catch (e) {
      if (process.env.VUE_APP_AUTHORIZED === 'true' && offline) {
        return Promise.resolve({ ...offline, ...{ result: 'success' } });
      } else {
        throw e;
      }
    }
  }
}

function handleError(data: APIResponseError): IHandleErrorResult {
  const message: Nullable<string> = 'Unknown Error';
  console.log(data);

  return { message };
}

axios.interceptors.request.use(function(config) {
  console.log('test', config.method, config.baseURL);
  if (
    config.method === 'get' &&
    !config.url?.startsWith('http') &&
    config.baseURL === process.env.VUE_APP_OPENWEATHER_API_BASE_URL
  ) {
    // console.log('base',config.baseURL ,config.url)
    config.params.appid = process.env.VUE_APP_OPENWEATHER_API_KEY;
  }

  return config;
});

axios.interceptors.response.use(
  function(response: AxiosResponse<APIResponseSuccess | APIResponseError>) {
    if (response.status === 200) {
      return Promise.resolve(response);
    }

    return Promise.reject(response);
  },
  async (error) => {
    const response: Nullable<APIResponseError> = error.response;

    if (!response) {
      return Promise.reject(error);
    }

    return Promise.reject(handleError(response));
  },
);
