import { logError } from "./logger.js"

//============================================================================
// EXERCISE 3: String Confusion - Email vs Phone vs Name
//
// ANTI-PATTERN: Every field is `string`. TypeScript treats all strings as
// interchangeable, so you can put an email in the name field and a name in
// the email field with zero complaints. Empty strings also pass silently.
//
// DDD FIX: Use distinct Branded Types for each domain concept.
// Each type gets its own smart constructor with format-specific validation.
//
// HINT:
//   type Email = string & { readonly __brand: unique symbol }
//   type Phone = string & { readonly __brand: unique symbol }
//   type CustomerName = string & { readonly __brand: unique symbol }
//
//   function createEmail(s: string): Email {
//       if (!/^[^@]+@[^@]+\.[^@]+$/.test(s)) throw new Error("Invalid email")
//       return s as Email
//   }
//   function createPhone(s: string): Phone {
//       if (!/^\d[\d\-]{6,}$/.test(s)) throw new Error("Invalid phone")
//       return s as Phone
//   }
//   function createCustomerName(s: string): CustomerName {
//       if (s.trim().length === 0) throw new Error("Name cannot be empty")
//       return s.trim() as CustomerName
//   }
//
// Now `Customer` becomes:
//   type Customer = { name: CustomerName; email: Email; phone: Phone }
//
// Swapping fields is a COMPILE-TIME error: Email is not assignable to Phone.
// This is the core DDD idea: make illegal states unrepresentable.
// ============================================================================

export function exercise3_StringConfusion() {
	type Email = string & { readonly __brand: unique symbol }
	type Phone = string & { readonly __brand: unique symbol }
	type CustomerName = string & { readonly __brand: unique symbol }

	const createEmail = (value: string): Email => {
		const trimmed = value.trim()
		const atIndex = trimmed.indexOf("@")
		const dotIndex = trimmed.lastIndexOf(".")
		if (
			trimmed.length === 0 ||
			atIndex <= 0 ||
			trimmed.lastIndexOf("@") !== atIndex ||
			dotIndex <= atIndex + 1 ||
			dotIndex === trimmed.length - 1
		) {
			throw new Error("Invalid email")
		}
		return trimmed as Email
	}

	const createPhone = (value: string): Phone => {
		const trimmed = value.trim()
		if (trimmed.length < 7) {
			throw new Error("Invalid phone")
		}
		if (trimmed[0] < "0" || trimmed[0] > "9") {
			throw new Error("Invalid phone")
		}

		let hasNonDigit = false
		for (const char of trimmed) {
			if (char >= "0" && char <= "9") {
				continue
			}
			if (char === "-") {
				continue
			}
			hasNonDigit = true
			break
		}

		if (hasNonDigit) {
			throw new Error("Invalid phone")
		}
		return trimmed as Phone
	}

	const createCustomerName = (value: string): CustomerName => {
		const trimmed = value.trim()
		if (trimmed.length === 0) {
			throw new Error("Name cannot be empty")
		}
		return trimmed as CustomerName
	}

	type Customer = {
		name: CustomerName
		email: Email
		phone: Phone
	}

	// TypeScript sees all strings as the same!
	const customer: Customer = {
		name: createCustomerName("John Doe"),
		email: createEmail("john@example.com"),
		phone: createPhone("555-123-4567"),
	}

	// TODO: Create separate branded types (Email, Phone, CustomerName) so
	// that swapping values between fields becomes a compile-time error.

	logError(3, "Fields mixed up - all are strings, TypeScript doesn't care", {
		customer,
		issue: "Email, phone, and name are all 'string' - no semantic distinction!",
	})

	// Even worse - empty strings pass validation
	const emptyCustomer: Customer = {
		name: createCustomerName("Jane Doe"),
		email: createEmail("jane@example.com"),
		phone: createPhone("555-987-6543"),
	}

	logError(3, "Empty strings accepted everywhere", {
		customer: emptyCustomer,
		issue: "Required fields should not be empty!",
	})

	try {
		createEmail("John Doe")
	} catch (error) {
		logError(3, "Email parsing now rejects invalid values", (error as Error).message)
	}

	try {
		createPhone("555-PIZZA")
	} catch (error) {
		logError(3, "Phone parsing now rejects invalid values", (error as Error).message)
	}

	try {
		createCustomerName("   ")
	} catch (error) {
		logError(3, "Customer name parsing now rejects empty values", (error as Error).message)
	}
}
