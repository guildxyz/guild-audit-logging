import axios from "axios";
import {
  AuditLogParams,
  AuditLoggingOptions,
  ILogger,
  ICorrelator,
  AuditLogRequest,
} from "./types";

/**
 * Util for creating audit logs
 */
export default class AuditLogger {
  /**
   * Name of the microservice
   */
  private service: string;

  /**
   * URL of the audit-logger microservice
   */
  private url: string;

  /**
   * Console logger util instance
   */
  private logger: ILogger;

  /**
   * Correlation id provider instance
   */
  private correlator: ICorrelator;

  /**
   * Set the audit logging options
   * @param options Options for audit logging
   */
  constructor(options: AuditLoggingOptions) {
    this.service = options.service;
    this.url = options.url;
    this.logger = options.logger;
    this.correlator = options.correlator;
  }

  /**
   * Add additional info to the audit log payload
   * @param params The parameters of the audit log entry
   * @param correlationId The correlation id associated with the event
   * @param timestamp The timestamp associated with the event
   * @returns The extended payload
   */
  private addMetadata = (
    params: AuditLogParams,
    correlationId: string,
    timestamp: number
  ): AuditLogRequest => {
    const children =
      params.children?.length > 0
        ? params.children.map((c) =>
            this.addMetadata(c, correlationId, timestamp)
          )
        : [];

    return {
      ...params,
      service: this.service,
      correlationId,
      timestamp,
      children,
    };
  };

  /**
   * Create an audit log entry
   * @param params Options to create the audit log
   * @returns The id of the created audit log
   */
  createAuditLog = async (params: AuditLogParams): Promise<number> => {
    try {
      const auditLogParams = this.addMetadata(
        params,
        this.correlator.getId(),
        Date.now()
      );
      const response = await axios.post<{ id: number }>(
        `${this.url}/log`,
        auditLogParams
      );
      return response.data.id;
    } catch (error: any) {
      this.logger.error(
        `Failed to create audit log ${error.message} ${JSON.stringify(
          error
        )} ${JSON.stringify(params)}`
      );
      return null;
    }
  };
}
