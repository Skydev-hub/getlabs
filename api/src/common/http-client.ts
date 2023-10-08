import { HttpService } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { merge } from 'lodash';

export class HttpClient {
  constructor(private readonly httpService: HttpService, private readonly config?: AxiosRequestConfig) {
    // const interceptors = this.httpService.axiosRef.interceptors;
    // interceptors.request.use((request: AxiosRequestConfig) => {
    //   console.log('Starting Request', request);
    //   return request;
    // });
    // interceptors.response.use(response => {
    //   console.log('Response:', response);
    //   return response;
    // });
  }

  request<T>(config: AxiosRequestConfig) {
    return this.httpService.request<T>(merge({}, this.config, config));
  }

  head<T>(url: string, config?: AxiosRequestConfig) {
    return this.httpService.head<T>(url, merge({}, this.config, config));
  }

  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.httpService.get<T>(url, merge({}, this.config, config));
  }

  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.httpService.delete<T>(url, merge({}, this.config, config));
  }

  post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.httpService.post<T>(url, data, merge({}, this.config, config));
  }

  put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.httpService.put<T>(url, data, merge({}, this.config, config));
  }

  patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.httpService.patch<T>(url, data, merge({}, this.config, config));
  }
}
