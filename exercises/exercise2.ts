import { logError } from "./logger.js"

// ============================================================================
// EXERCISE 2: Primitive Obsession - The Quantity Disaster
//
// ANTI-PATTERN: Using a raw `number` for quantity. Accepts zero, negatives,
// floats (2.5 pizzas?), and absurd values (50,000 coffees).
//
// DDD FIX: Create a Quantity Value Object with domain constraints.
// Business rules belong INSIDE the type, not scattered across the codebase.
//
// HINT - Smart Constructor pattern:
//   type Quantity = number & { readonly __brand: unique symbol }
//   function createQuantity(n: number): Quantity {
//       if (!Number.isInteger(n)) throw new Error("Quantity must be a whole number")
//       if (n <= 0) throw new Error("Quantity must be positive")
//       if (n > 100) throw new Error("Quantity exceeds maximum per order")
//       return n as Quantity
//   }
//
// KEY INSIGHT: The upper bound (100) is a business rule, not an arbitrary
// limit. In DDD, domain experts define these constraints. Your code should
// make them explicit and impossible to bypass.
// ============================================================================

export function exercise2_PrimitiveQuantity() {
	type Quantity = number & { readonly __brand: unique symbol }

	const createQuantity = (quantity: number): Quantity => {
		if (!Number.isInteger(quantity)) {
			throw new Error("Quantity must be a whole number")
		}
		if (quantity <= 0) {
			throw new Error("Quantity must be positive")
		}
		if (quantity > 100) {
			throw new Error("Quantity exceeds maximum per order")
		}
		return quantity as Quantity
	}

	type Order = {
		itemName: string
		quantity: Quantity
		pricePerUnit: number
	}

	const order: Order = {
		itemName: "Pizza",
		quantity: createQuantity(2),
		pricePerUnit: 15,
	}

	// TODO completed: quantity now uses the Quantity branded type.
	// Invalid quantities now fail at creation time:
	//   quantity: -3
	//   quantity: 50000

	const total = order.quantity * order.pricePerUnit
	logError(2, "It let a negative quantity pass", {
		order,
		calculatedTotal: total,
		issue: "Quantity should be a whole number above 0.",
	})

	// Another silent bug - absurd quantity
	const bulkOrder: Order = {
		itemName: "Coffee",
		quantity: createQuantity(15),
		pricePerUnit: 3,
	}

	logError(2, "It also allowed a way too big quantity", {
		order: bulkOrder,
		calculatedTotal: bulkOrder.quantity * bulkOrder.pricePerUnit,
		issue: "No way we should allow 50,000 coffees in one order.",
	})

	try {
		createQuantity(-3)
	} catch (error) {
		logError(2, "Now negative quantity throws", (error as Error).message)
	}

	try {
		createQuantity(50_000)
	} catch (error) {
		logError(2, "Now huge quantity throws too", (error as Error).message)
	}
}
