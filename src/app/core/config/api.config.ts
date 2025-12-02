import { environment } from '../../../environments/environment';

export const API_CONFIG = {
  baseUrl: environment.apiUrl,
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      me: '/auth/me',
      changePassword: '/auth/change-password'
    },
    users: '/users',
    productModels: '/product-models',
    inventory: '/inventory',
    catalog: '/catalog',
    requests: '/requests',
    quotes: '/quotes',
    contracts: '/contracts',
    tickets: '/tickets',
    invoices: '/invoices',
    payments: '/payments',
    myEquipment: '/my-equipment',
    dashboard: {
      admin: '/dashboard/admin',
      client: '/dashboard/client'
    }
  }
};
