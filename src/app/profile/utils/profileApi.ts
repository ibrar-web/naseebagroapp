export const unwrapApiData = (response: any) => {
  if (response?.data !== undefined) {
    return response.data;
  }

  if (response?.result !== undefined) {
    return response.result;
  }

  return response;
};

export const firstDefined = <T>(...values: T[]) =>
  values.find(value => value !== undefined && value !== null);

export const firstString = (...values: any[]) => {
  const value = firstDefined(...values);

  if (value === undefined || value === null) {
    return '';
  }

  return String(value);
};

export const toBoolean = (value: any, fallback = false) => {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'enabled', 'approved'].includes(
      value.toLowerCase(),
    );
  }

  return Boolean(value);
};

export const formatDisplayDate = (value: any) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const normalizeList = (response: any, keys: string[] = []) => {
  const payload = unwrapApiData(response);

  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
};
