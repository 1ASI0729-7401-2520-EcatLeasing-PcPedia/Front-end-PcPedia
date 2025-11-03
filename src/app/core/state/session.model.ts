// Modelo simple de usuario de sesión
export interface SessionUser {
  id: string;
  email: string;
  displayName?: string;
  roles?: string[];           // p.ej. ['admin', 'user']
  avatarUrl?: string;
  // agrega aquí lo que realmente devuelvan tus APIs
}
