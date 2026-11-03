/** An error the API turns into a JSON response: { error: { code, message } }. */
export class ApiError extends Error {
  constructor(
    readonly status: 400 | 404 | 409,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export const notFound = (what: string, id: string) => new ApiError(404, "not_found", `No ${what} with id ${id}.`);

/** A request that would break one of the rules in RULES.md. */
export const ruleViolation = (code: string, message: string) => new ApiError(409, code, message);

export const invalid = (message: string) => new ApiError(400, "invalid_request", message);
