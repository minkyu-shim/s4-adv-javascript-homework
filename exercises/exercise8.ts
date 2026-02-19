import { logError } from "./logger.js"

//============================================================================
// EXERCISE 8: The Email Validation Gap
//
// ANTI-PATTERN: Using `string` for email. TypeScript's type system cannot
// distinguish "alice@example.com" from "not-an-email" -- they're both strings.
// Every invalid format silently passes through.
//
// DDD FIX: Apply the "Parse, Don't Validate" principle.
// Instead of validating a string and hoping callers remember to check,
// parse it into a domain type. Once you have an `Email`, it is guaranteed
// valid -- no further checking needed anywhere in the codebase.
//
// HINT:
//   type Email = string & { readonly __brand: unique symbol }
//
//   function parseEmail(raw: string): Email {
//       const trimmed = raw.trim()
//       if (trimmed.length === 0) throw new Error("Email cannot be empty")
//       // Basic structural check: local@domain.tld
//       if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
//           throw new Error(`Invalid email format: "${raw}"`)
//       return trimmed.toLowerCase() as Email
//   }
//
// KEY INSIGHT - "Parse, Don't Validate":
//   - Validation checks a value and returns boolean -> caller can ignore it.
//   - Parsing converts raw input into a strong type or throws -> impossible
//     to have an invalid Email in the system.
//   - This is a core DDD principle: push validation to the boundary of
//     your system (user input, API responses) and work with guaranteed-valid
//     types everywhere else.
// ============================================================================

export function exercise8_EmailValidation() {
	type Email = string & { readonly __brand: unique symbol }

	const parseEmail = (raw: string): Email => {
		const trimmed = raw.trim().toLowerCase()
		if (trimmed.length === 0) {
			throw new Error("Email cannot be empty")
		}

		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailPattern.test(trimmed)) {
			throw new Error(`Invalid email format: "${raw}"`)
		}

		return trimmed as Email
	}

	type Customer = {
		name: string
		email: Email
	}

	// TODO completed: Customer.email uses branded Email from parseEmail().

	const rawCustomers = [
		{ name: "Alice", email: "alice@example.com" }, // Valid
		{ name: "Bob", email: "not-an-email" }, // Silent bug!
		{ name: "Charlie", email: "charlie@@double.com" }, // Silent bug!
		{ name: "Diana", email: "@no-local-part.com" }, // Silent bug!
		{ name: "Eve", email: "eve@" }, // Silent bug!
		{ name: "Frank", email: " " }, // Silent bug! Just whitespace
	]

	const customers: Customer[] = []

	for (const rawCustomer of rawCustomers) {
		try {
			customers.push({
				name: rawCustomer.name,
				email: parseEmail(rawCustomer.email),
			})
		} catch (error) {
			logError(8, "Skipped customer because email is invalid", {
				customer: rawCustomer,
				reason: (error as Error).message,
			})
		}
	}

	logError(8, "Only customers with valid emails are kept", {
		customers,
		issue: "Raw invalid strings do not become Email values.",
	})
}
