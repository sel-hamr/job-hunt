// The errors services throw. Tools and API routes turn each kind into the right answer:
// a clear message for the AI, or an HTTP status for the dashboard.

export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

// The id doesn't exist. API: 404.
export class NotFoundError extends AppError {}

// It already exists (a duplicate skill or language). API: 409.
export class ConflictError extends AppError {}

// A rule is broken (dates in the wrong order, a missing name). API: 400.
export class RuleError extends AppError {}
