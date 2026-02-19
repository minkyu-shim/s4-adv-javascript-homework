import { logError } from "./logger.js"

//============================================================================
// EXERCISE 5: The Identity Crisis - Order IDs
//
// ANTI-PATTERN: Using a plain `string` for an identifier. Nothing enforces
// format, non-emptiness, or uniqueness. Duplicate and empty IDs slip through.
//
// DDD FIX: Model identity as a dedicated Value Object with a controlled
// creation strategy. In DDD, the identity of an Entity is a first-class
// concept -- it deserves its own type.
//
// HINT - Branded type + factory:
//   type OrderId = string & { readonly __brand: unique symbol }
//
//   // Option A: Enforce a format (e.g., "ORD-" prefix + numeric)
//   function createOrderId(raw: string): OrderId {
//       if (!/^ORD-\d{5,}$/.test(raw))
//           throw new Error("OrderId must match ORD-XXXXX format")
//       return raw as OrderId
//   }
//
//   // Option B: Generate guaranteed-unique IDs (UUID-based)
//   function generateOrderId(): OrderId {
//       return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` as OrderId
//   }
//
// For uniqueness across a collection, use a Repository pattern: the
// Repository is responsible for ensuring no two Entities share an ID.
// This separates identity validation (Value Object) from uniqueness
// enforcement (Repository).
// ============================================================================

export function exercise5_IdentityCrisis() {
	type OrderId = string & { readonly __brand: unique symbol }

	const createOrderId = (raw: string): OrderId => {
		const trimmed = raw.trim()
		if (!/^ORD-\d{5,}$/.test(trimmed)) {
			throw new Error("OrderId must match ORD-XXXXX format")
		}
		return trimmed as OrderId
	}

	type Order = {
		orderId: OrderId
		customerName: string
		total: number
	}

	class OrderRepository {
		private readonly orders = new Map<OrderId, Order>()

		add(order: Order): void {
			if (this.orders.has(order.orderId)) {
				throw new Error(`Duplicate orderId: ${order.orderId}`)
			}
			this.orders.set(order.orderId, order)
		}

		list(): Order[] {
			return Array.from(this.orders.values())
		}
	}

	// TODO completed: OrderId is now a branded type and uniqueness is
	// enforced by the repository.
	const repository = new OrderRepository()

	const rawOrders = [
		{
			orderId: "", // Silent bug! Empty ID
			customerName: "Alice",
			total: 25,
		},
		{
			orderId: "ORD-12345",
			customerName: "Bob",
			total: 30,
		},
		{
			orderId: "ORD-12345", // Silent bug! Duplicate ID
			customerName: "Charlie",
			total: 15,
		},
		{
			orderId: "not-a-number", // Silent bug! Inconsistent format
			customerName: "Diana",
			total: 20,
		},
		{
			orderId: "ORD-67890",
			customerName: "Eve",
			total: 22,
		},
	]

	for (const rawOrder of rawOrders) {
		try {
			const order: Order = {
				orderId: createOrderId(rawOrder.orderId),
				customerName: rawOrder.customerName,
				total: rawOrder.total,
			}
			repository.add(order)
		} catch (error) {
			logError(5, "Skipped this order because id is bad or already used", {
				order: rawOrder,
				reason: (error as Error).message,
			})
		}
	}

	logError(5, "Repository now has only good unique IDs", {
		orders: repository.list(),
		issue: "Order id format and duplicates are checked.",
	})
}
