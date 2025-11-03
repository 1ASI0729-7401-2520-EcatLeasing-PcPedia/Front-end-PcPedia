import { environment } from '../../../environments/environment'; // o environments si renombraste
export const API_BASE = environment.apiBase;

const join = (...parts: Array<string | number | undefined>) =>
  parts.filter(Boolean).join('/');

export const Endpoints = {
  devices: {
    list: () => join(API_BASE, 'devices'),
    byId: (id: string | number) => join(API_BASE, 'devices', id),
  },
  orders: {
    list: () => join(API_BASE, 'orders'),
    byId: (id: string | number) => join(API_BASE, 'orders', id),
  },
  returns: {
    list: () => join(API_BASE, 'returns'),
    byId: (id: string | number) => join(API_BASE, 'returns', id),
  },
  notifications: {
    list: () => join(API_BASE, 'notifications'),
    byId: (id: string | number) => join(API_BASE, 'notifications', id),
  },
  payments: {
    list: () => join(API_BASE, 'payments'),
    byId: (id: string | number) => join(API_BASE, 'payments', id),
  },
  maintenance: {
    list: () => join(API_BASE, 'maintenance'),
    byId: (id: string | number) => join(API_BASE, 'maintenance', id),
  },
  companies: {
    list: () => join(API_BASE, 'companies'),
    byId: (id: string | number) => join(API_BASE, 'companies', id),
  },
  auth: {
    loginByEmail: (email: string) =>
      join(API_BASE, 'users') + `?email=${encodeURIComponent(email)}`,
  },
  shipments: {
    list: () => join(API_BASE, 'shipments'),
    byId: (id: string | number) => join(API_BASE, 'shipments', id),
  },

} as const;
