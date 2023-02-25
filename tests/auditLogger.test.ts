/* eslint-disable no-console */
/* eslint-disable dot-notation */
import axios from "axios";
import AuditLogger from "../src/AuditLogger";
import { AuditLogParams, ICorrelator, ILogger } from "../src/types";

// setup test values
const testService = "test service";
const testUrl = "https://test.url";
const testTimestamp = 1677326272;
const testCorrelationId = "4fb94571-7f97-4fe0-a1b8-eb82994fb754";

// setup test functions & object
const testLogMethod = (message: string) => {
  console.log(message);
};

const testLogger: ILogger = {
  debug: testLogMethod,
  error: testLogMethod,
  info: testLogMethod,
  verbose: testLogMethod,
  warn: testLogMethod,
};

const testCorrelator: ICorrelator = {
  getId() {
    return testCorrelationId;
  },
};

const auditLogParams: AuditLogParams = {
  action: "join guild",
  children: [{ action: "get role" }],
};

describe("Check AuditLogger", () => {
  test("Check constructor", async () => {
    // create instance
    const auditLogger = new AuditLogger({
      service: testService,
      url: testUrl,
      logger: testLogger,
      correlator: testCorrelator,
    });

    // test
    expect(auditLogger["service"]).toBe(testService);
    expect(auditLogger["url"]).toBe(testUrl);
    expect(auditLogger["logger"]).toBe(testLogger);
    expect(auditLogger["correlator"]).toBe(testCorrelator);
  });

  test("Check addMetadata", async () => {
    // create instance
    const auditLogger = new AuditLogger({
      service: testService,
      url: testUrl,
      logger: testLogger,
      correlator: testCorrelator,
    });

    // call method
    const result = auditLogger["addMetadata"](
      auditLogParams,
      testCorrelationId,
      testTimestamp
    );

    // test
    expect(result.action).toBe(auditLogParams.action);
    expect(result.correlationId).toBe(testCorrelationId);
    expect(result.timestamp).toBe(testTimestamp);
    expect(result.service).toBe(testService);

    expect(result.children?.[0]?.action).toBe(
      auditLogParams.children?.[0].action
    );
    expect(result.children?.[0]?.correlationId).toBe(testCorrelationId);
    expect(result.children?.[0]?.timestamp).toBe(testTimestamp);
    expect(result.children?.[0]?.service).toBe(testService);
  });

  test("Check createAuditLog", async () => {
    // setup mock result
    const auditLogId = 32432;

    // setup mocking
    jest
      .spyOn(axios, "post")
      .mockImplementation(async (url: string, data: any) => {
        // test
        expect(url).toBe(`${testUrl}/log`);

        expect(data.action).toBe(auditLogParams.action);
        expect(data.correlationId).toBe(testCorrelationId);
        expect(data.service).toBe(testService);

        expect(data.children?.[0]?.action).toBe(
          auditLogParams.children?.[0].action
        );
        expect(data.children?.[0]?.correlationId).toBe(testCorrelationId);
        expect(data.children?.[0]?.service).toBe(testService);

        // return mock result
        return { data: { id: auditLogId } };
      });

    // create instance
    const auditLogger = new AuditLogger({
      service: testService,
      url: testUrl,
      logger: testLogger,
      correlator: testCorrelator,
    });

    // call method
    const result = await auditLogger.createAuditLog(auditLogParams);

    // test
    expect(result).toBe(auditLogId);
  });

  test("Check createAuditLog error handling", async () => {
    // setup mocking
    jest.spyOn(axios, "post").mockImplementation(async () => {
      throw new Error("test error");
    });

    jest.spyOn(testLogger, "error").mockImplementation((message) => {
      expect(message).toBe(
        'Failed to create audit log test error {} {"action":"join guild","children":[{"action":"get role"}]}'
      );
    });

    // create instance
    const auditLogger = new AuditLogger({
      service: testService,
      url: testUrl,
      logger: testLogger,
      correlator: testCorrelator,
    });

    // call method
    const result = await auditLogger.createAuditLog(auditLogParams);

    // test
    expect(result).toBe(null);
  });
});
