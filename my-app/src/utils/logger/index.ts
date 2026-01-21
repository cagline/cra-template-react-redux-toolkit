import Config from "../../config";
import type { ILogger } from "./ILogger";

class Logger implements ILogger {
  protected logLevel: string;
  protected logHierarchy: any = {
    verbose: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
  };

  constructor() {
    this.logLevel = Config.logLevel.toLocaleLowerCase();
  }

  public debug = (application: string, component: string, message: any): void => {
    if (this.validateLogHierachy("debug")) {
      this.message(application, component, "debug", message);
    }
  };

  public verbose = (application: string, component: string, message: any): void => {
    if (this.validateLogHierachy("verbose")) {
      this.message(application, component, "verbose", message);
    }
  };

  public info = (application: string, component: string, message: any): void => {
    if (this.validateLogHierachy("info")) {
      this.message(application, component, "info", message);
    }
  };

  public warn = (application: string, component: string, message: any): void => {
    if (this.validateLogHierachy("warn")) {
      this.message(application, component, "warn", message);
    }
  };

  public error = (application: string, component: string, message: any): void => {
    if (this.validateLogHierachy("error")) {
      this.message(application, component, "error", message);
    }
  };

  private validateLogHierachy(logLevel: string): boolean {
    return this.logHierarchy[this.logLevel] <= this.logHierarchy[logLevel];
  }

  private readonly message = (application: string, component: string, level: string, message: any) => {
    if (typeof message !== "string") {
      message = JSON.stringify(message);
    }

    const maskedMessage = `${level} : ${application}: ${component}: ${message}`;

    switch (level.toLowerCase()) {
      case "verbose":
        console.log(maskedMessage);
        break;
      case "debug":
        console.debug(maskedMessage);
        break;
      case "info":
        console.info(maskedMessage);
        break;
      case "warning":
        console.warn(maskedMessage);
        break;
      case "error":
        console.error(maskedMessage);
        break;
      default:
        console.log(maskedMessage);
        break;
    }
  };
}

export default new Logger();
