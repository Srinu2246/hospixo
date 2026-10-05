type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

type LogContext = Readonly<Record<string, unknown>>;

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

const SENSITIVE_KEYS = new Set([
  'password',
  'confirm_password',
  'quick_pin',
  'otp',
  'identifier',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
]);

type Logger = Readonly<{
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, error?: unknown, context?: LogContext) => void;
}>;

function resolveLogLevel(): LogLevel {
  const configured = process.env.LOG_LEVEL?.toLowerCase();

  if (
    configured === 'debug' ||
    configured === 'info' ||
    configured === 'warn' ||
    configured === 'error' ||
    configured === 'silent'
  ) {
    return configured;
  }

  return process.env.NODE_ENV === 'production' ? 'warn' : 'info';
}

function shouldLog(level: LogLevel) {
  return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[resolveLogLevel()];
}

function sanitizeValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEYS.has(key)) {
    return '[redacted]';
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(key, item));
  }

  if (value && typeof value === 'object') {
    return sanitizeContext(value as Record<string, unknown>);
  }

  return value;
}

function sanitizeContext(context: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [key, sanitizeValue(key, value)]),
  );
}

function write(level: LogLevel, namespace: string, message: string, context?: LogContext) {
  if (!shouldLog(level)) {
    return;
  }

  const prefix = `[${namespace}]`;
  const payload = context ? sanitizeContext(context) : undefined;

  switch (level) {
    case 'debug':
      if (payload) {
        console.debug(prefix, message, payload);
      } else {
        console.debug(prefix, message);
      }
      break;
    case 'info':
      if (payload) {
        console.info(prefix, message, payload);
      } else {
        console.info(prefix, message);
      }
      break;
    case 'warn':
      if (payload) {
        console.warn(prefix, message, payload);
      } else {
        console.warn(prefix, message);
      }
      break;
    case 'error':
      if (payload) {
        console.error(prefix, message, payload);
      } else {
        console.error(prefix, message);
      }
      break;
    default:
      break;
  }
}

export function createLogger(namespace: string): Logger {
  return {
    debug(message, context) {
      write('debug', namespace, message, context);
    },
    info(message, context) {
      write('info', namespace, message, context);
    },
    warn(message, context) {
      write('warn', namespace, message, context);
    },
    error(message, error, context) {
      const mergedContext =
        error === undefined
          ? context
          : {
              ...context,
              error:
                error instanceof Error
                  ? { name: error.name, message: error.message, stack: error.stack }
                  : error,
            };

      write('error', namespace, message, mergedContext);
    },
  };
}

/** Centralized application logger — import from here instead of using console directly. */
export const logger = {
  api: createLogger('api'),
  auth: createLogger('auth'),
  marketing: createLogger('marketing'),
  app: createLogger('app'),
} as const;

export function logApiRequest(
  input: Readonly<{ method: string; path: string; hasBody: boolean; hasToken: boolean }>,
) {
  logger.api.debug('request', input);
}

export function logApiResponse(
  input: Readonly<{
    method: string;
    path: string;
    status: number;
    durationMs: number;
    ok: boolean;
  }>,
) {
  if (input.ok) {
    logger.api.debug('response', input);
    return;
  }

  logger.api.warn('response', input);
}

export function logApiFailure(
  input: Readonly<{ method: string; path: string; durationMs: number; targetUrl?: string }>,
  error: unknown,
) {
  const context =
    error instanceof Error
      ? {
          ...input,
          error: { name: error.name, message: error.message },
        }
      : { ...input, error };

  logger.api.warn('request failed', context);
}

export function logAuthOperation(
  /** @description The operation to log */
  operation: string,
  /** @description The context of the operation */
  context?: LogContext,
) {
  logger.auth.info(operation, context);
}
