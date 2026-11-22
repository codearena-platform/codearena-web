/** Shape returned by POST /api/validate, including its non-2xx error variant. */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function failure(message: string): ValidationResult {
  return { valid: false, errors: [message], warnings: [], score: 0 };
}

/**
 * Convert any fetch payload into a renderable result so a malformed server
 * response can never crash the editor during render.
 */
export function normalizeValidationResponse(status: number, payload: unknown): ValidationResult {
  const record = isRecord(payload) ? payload : null;
  const serverError = record && typeof record.error === "string" ? record.error : null;

  if (!Number.isFinite(status) || status < 200 || status > 299) {
    return failure(serverError || `Validation failed (${status})`);
  }
  if (!record) return failure("Validation service returned an invalid response");
  if (
    typeof record.valid !== "boolean" ||
    !isStringArray(record.errors) ||
    !isStringArray(record.warnings) ||
    typeof record.score !== "number" ||
    !Number.isFinite(record.score)
  ) {
    return failure(serverError || "Validation service returned an invalid response");
  }

  return {
    valid: record.valid,
    errors: record.errors,
    warnings: record.warnings,
    score: record.score,
  };
}
