import HttpService from './httpService';

/**
 * Unwraps the standard API response wrapper:
 * { status: number, message: string, data: any }
 * Returns the inner `data` payload directly.
 */
const unwrapServerData = (axiosData: any) => {
  if (
    axiosData &&
    typeof axiosData === 'object' &&
    'status' in axiosData &&
    'data' in axiosData
  ) {
    return axiosData.data;
  }
  return axiosData;
};

export const Get = (path: string, params?: Record<string, any>) => {
  const apiService = new HttpService();
  return new Promise(async (accept, reject) => {
    try {
      const response = await apiService.get(path, params ? { params } : undefined);
      console.log('Get',response)
      accept(unwrapServerData(response.data));
    } catch (error) {
      reject(error);
    }
  });
};

export const Post = (path: string, payload: any) => {
  const apiService = new HttpService();
  return new Promise(async (accept, reject) => {
    try {
      console.log(apiService)
      // FormData is detected automatically by HttpService.post()
      const response = await apiService.post(path, payload);
      accept(unwrapServerData(response.data));
    } catch (error) {
      reject(error);
    }
  });
};

export const Patch = (path: string, payload: any) => {
  const apiService = new HttpService();
  return new Promise(async (accept, reject) => {
    try {
      const response = await apiService.patch(path, payload);
      accept(unwrapServerData(response.data));
    } catch (error) {
      reject(error);
    }
  });
};

export const Put = (path: string, payload: any) => {
  const apiService = new HttpService();
  console.log('PUT-API => ', path);
  return new Promise(async (accept, reject) => {
    try {
      const response = await apiService.put(path, payload);
      accept(unwrapServerData(response.data));
    } catch (error) {
      reject(error);
    }
  });
};

export const Delete = (path: string, payload?: any) => {
  const apiService = new HttpService();
  return new Promise(async (accept, reject) => {
    try {
      const response = await apiService.delete(path, payload);
      accept(unwrapServerData(response.data));
    } catch (error) {
      reject(error);
    }
  });
};
