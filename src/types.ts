/* eslint-disable no-unused-vars */
export type Action =
  | "create guild"
  | "update guild"
  | "delete guild"
  | "add admin"
  | "remove admin"
  | "show members on"
  | "show members off"
  | "hide from explorer on"
  | "hide from explorer off"
  | "create role"
  | "update role"
  | "delete role"
  | "add reward"
  | "remove reward"
  | "update reward"
  | "add requirement"
  | "update requirement"
  | "remove requirement"
  | "start status update"
  | "restart status update"
  | "stop status update"
  | "join guild"
  | "leave guild"
  | "kick from guild"
  | "user status update"
  | "get role"
  | "lose role"
  | "send reward"
  | "get reward"
  | "revoke reward"
  | "lose reward"
  | "connect identity"
  | "disconnect identity"
  | "create poap"
  | "activate poap"
  | "claim poap"
  | "pay for poap"
  | "transfer ownership"
  | "execute pending actions"
  | "click join on web"
  | "click join on platform";

export type AuditLogIds = {
  userId?: number;
  guildId?: number;
  roleId?: number;
  requirementId?: number;
  rolePlatformId?: number;
  poapId?: number;
};

export type AuditLogParams = AuditLogIds & {
  action: Action;
  snapshot?: any;
  before?: any;
  data?: any;
  parentId?: number;
  children?: AuditLogParams[];
};

export type AuditLogMetadata = {
  correlationId: string;
  timestamp: number;
  service: string;
};

export type AuditLogRequest = AuditLogParams &
  AuditLogMetadata & { children?: AuditLogRequest[] };

export type AuditLogSnapshot = {
  user?: string;
  guild?: string;
  role?: string;
  poap?: any;
};

export type AuditLogResponse = {
  id: number;
  actionName: string;
  correlationId: string;
  service: string;
  timestamp: number;
  userId?: number;
  guildId?: number;
  roleId?: number;
  requirementId?: number;
  rolePlatformId?: number;
  poapId?: number;
  snapshot?: any;
  before?: any;
  data?: any;
  parentId?: number;
};

interface ILogMethod {
  (message: string): any;
}

export interface ILogger {
  debug: ILogMethod;
  error: ILogMethod;
  warn: ILogMethod;
  info: ILogMethod;
  verbose: ILogMethod;
}

export interface ICorrelator {
  getId: () => string;
}

export type AuditLoggingOptions = {
  service: string;
  url: string;
  logger: ILogger;
  correlator: ICorrelator;
};
