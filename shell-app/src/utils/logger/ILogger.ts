export interface ILogger {
  debug(application: string, component: string, message: string): void;
  verbose(application: string, component: string, message: string): void;
  info(application: string, component: string, message: string): void;
  warn(application: string, component: string, message: string): void;
  error(application: string, component: string, message: string): void;
}
