export const logger = {
  info: (message: any, ...args: any[]) => {
    if (typeof message === 'string') {
      console.info(`[INFO] ${message}`, ...args);
    } else {
      console.info(`[INFO]`, message, ...args);
    }
  },
  warn: (message: any, ...args: any[]) => {
    if (typeof message === 'string') {
      console.warn(`[WARN] ${message}`, ...args);
    } else {
      console.warn(`[WARN]`, message, ...args);
    }
  },
  error: (message: any, ...args: any[]) => {
    if (typeof message === 'string') {
      console.error(`[ERROR] ${message}`, ...args);
    } else {
      console.error(`[ERROR]`, message, ...args);
    }
  },
  debug: (message: any, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      if (typeof message === 'string') {
        console.debug(`[DEBUG] ${message}`, ...args);
      } else {
        console.debug(`[DEBUG]`, message, ...args);
      }
    }
  }
};
