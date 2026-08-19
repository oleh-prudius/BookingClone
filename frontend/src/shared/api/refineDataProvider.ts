import type { DataProvider } from '@refinedev/core';
import { httpClient } from './httpClient';

// Refine v5 DataProvider has invariant generics that require `as unknown as DataProvider`
export const dataProvider = {
  getList: async ({ resource, pagination, filters }: Parameters<DataProvider['getList']>[0]) => {
    const p = pagination as { currentPage?: number; current?: number; page?: number; pageSize?: number } | undefined;
    const page = p?.currentPage ?? p?.current ?? p?.page ?? 1;
    const pageSize = p?.pageSize ?? 10;
    const params: Record<string, unknown> = { page, pageSize };
    for (const filter of filters ?? []) {
      if ('field' in filter && filter.value !== undefined && filter.value !== '') {
        params[filter.field] = filter.value;
      }
    }
    const { data } = await httpClient.get(`/${resource}`, { params });
    const items = Array.isArray(data) ? data : (data.items ?? []);
    return { data: items, total: (data.totalCount ?? items.length) as number };
  },

  getOne: async ({ resource, id }: Parameters<DataProvider['getOne']>[0]) => {
    const { data } = await httpClient.get(`/${resource}/${id}`);
    return { data };
  },

  create: async ({ resource, variables }: Parameters<DataProvider['create']>[0]) => {
    const { data } = await httpClient.post(`/${resource}`, variables);
    return { data };
  },

  update: async ({ resource, id, variables }: Parameters<DataProvider['update']>[0]) => {
    await httpClient.put(`/${resource}/${id}`, variables);
    return { data: { id, ...(variables as object) } };
  },

  deleteOne: async ({ resource, id }: Parameters<DataProvider['deleteOne']>[0]) => {
    await httpClient.delete(`/${resource}/${id}`);
    return { data: { id } };
  },

  getApiUrl: () => httpClient.defaults.baseURL ?? '',
} as unknown as DataProvider;
