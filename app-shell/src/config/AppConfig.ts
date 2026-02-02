export type AppConfig = {
  env: string;
  logLevel: string;
  X_API_KEY: string;
  keycloakEnabled: boolean;
  applicationConfig: {
    appTimeZone: string,
    paginationConfig: {
      pageSizeOptions: Array<number>,
      defaultSize: number;
    }
  };
  baseUrl: string;
  keycloak: {
    keycloakUrl: string;
    realm: string;
    clientId: string;
  }
  roles: object,

};
