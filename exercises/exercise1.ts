import { logError } from "./logger.js"

//============================================================================
// EXERCISE 1: Primitive Obsession - The Price Problem
//
// ANTI-PATTERN: Using a raw `number` for price. Nothing prevents negative
// values, absurdly large amounts, or mixing up units (see also Exercise 7).
//
// DDD FIX: Create a Value Object (or Branded Type) for Price.
// A Value Object is an immutable domain concept defined by its value, not by
// an identity. It enforces its own invariants at construction time.
//
// HINT - Branded Type approach:
//   type Price = number & { readonly __brand: unique symbol }
//   function createPrice(amount: number): Price {
//       if (amount < 0) throw new Error("Price cannot be negative")
//       if (amount > 10_000) throw new Error("Price exceeds maximum")
//       return amount as Price
//   }
//
// With this pattern, `MenuItem.price` becomes `Price` instead of `number`.
// TypeScript will refuse to assign a plain number where a Price is expected,
// so every price in the system is guaranteed valid by construction.
// ============================================================================

export function exercise1_PrimitivePrice() {
	type Price = number & { readonly __brand: unique symbol }

	const createPrice = (amount: number): Price => {
		if (amount < 0) {
			throw new Error("Price cannot be negative")
		}
		if (amount > 10_000) {
			throw new Error("Price exceeds maximum")
		}
		return amount as Price
	}

	// Without domain types, price is just a number
	type MenuItem = {
		name: string
		price: Price
		quantity: number
	}

	const orderItem: MenuItem = {
		name: "Burger",
		price: createPrice(50),
		quantity: 1,
	}

	// TODO completed: price now uses the Price branded type and can only be
	// created via createPrice().

	const total = orderItem.price * orderItem.quantity
	logError(1, "Oops, this accepted a negative price", {
		item: orderItem.name,
		price: orderItem.price,
		calculatedTotal: total,
		issue: "Price should not be below 0.",
	})

	try {
		createPrice(-50)
	} catch (error) {
		logError(
			1,
			"Now it throws when price is negative",
			(error as Error).message,
		)
	}
}
