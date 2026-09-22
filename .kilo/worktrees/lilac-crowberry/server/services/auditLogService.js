import AuditLog from "../models/auditLog.js";

export const createAuditLog = async ({
  actor,

  action,

  module,

  target = null,

  description,

  before = null,

  after = null,

  req = null,

  status = "success",

  errorMessage = "",

  metadata = {},
}) => {
  try {
    const ip =
      req?.headers?.["x-forwarded-for"]?.split(",")?.[0]?.trim() ||
      req?.socket?.remoteAddress ||
      req?.ip ||
      "";

    const userAgent = req?.headers?.["user-agent"] || "";

    return await AuditLog.create({
      actor: {
        id: actor.id,

        type: actor.type || "admin",

        name: actor.name || "",

        email: actor.email || "",
      },

      action,

      module,

      target: target
        ? {
            id: target.id || null,

            type: target.type || "",

            name: target.name || "",
          }
        : undefined,

      description,

      changes: {
        before,
        after,
      },

      request: {
        method: req?.method || "",

        path: req?.originalUrl || req?.url || "",

        ip,

        userAgent,
      },

      status,

      errorMessage,

      metadata,
    });
  } catch (error) {
    /*
      Audit log failure se main API
      fail nahi honi chahiye.
    */

    console.error("AUDIT LOG ERROR:", error);

    return null;
  }
};
