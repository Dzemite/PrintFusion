export interface Environment {
  production: boolean;
  apiUrl: string;
}

export enum ENV {
  PRODICTION = 'production',
  API_URL = 'apiUrl'
}