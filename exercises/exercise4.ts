import { logError } from "./logger.js"

//============================================================================
// EXERCISE 4: Business Rule Violation - Table Capacity
//
// ANTI-PATTERN: Using a plain data structure (anemic type) with no
// invariant enforcement. Nothing prevents currentGuests > capacity or
// negative guest counts. The type is just a bag of numbers.
//
// DDD FIX: Use an Entity with enforced invariants.
// Unlike Value Objects (which are defined by their value), an Entity has
// a unique identity (tableNumber) and a lifecycle. Invariants (business
// rules that must ALWAYS be true) are enforced in the constructor and
// in every method that mutates state.
//
// HINT - Entity with private constructor:
//   class Table {
//       private constructor(
//           public readonly tableNumber: number,
//           public readonly capacity: number,
//           private _currentGuests: number,
//       ) {}
//
//       static create(tableNumber: number, capacity: number): Table {
//           if (capacity <= 0) throw new Error("Capacity must be positive")
//           return new Table(tableNumber, capacity, 0)
//       }
//
//       get currentGuests(): number { return this._currentGuests }
//
//       seatGuests(count: number): void {
//           if (count <= 0) throw new Error("Guest count must be positive")
//           if (this._currentGuests + count > this.capacity)
//               throw new Error("Exceeds table capacity")
//           this._currentGuests += count
//       }
//   }
//
// KEY INSIGHT: The invariant (guests <= capacity) is enforced by the Entity
// itself. External code cannot put the Entity into an invalid state because
// there is no public way to set _currentGuests directly.
// ============================================================================

export function exercise4_BusinessRuleViolation() {
	class Table {
		private constructor(
			public readonly tableNumber: number,
			public readonly capacity: number,
			private _currentGuests: number,
		) {}

		static create(tableNumber: number, capacity: number): Table {
			if (!Number.isInteger(tableNumber) || tableNumber <= 0) {
				throw new Error("Table number must be a positive integer")
			}
			if (!Number.isInteger(capacity) || capacity <= 0) {
				throw new Error("Capacity must be a positive integer")
			}
			return new Table(tableNumber, capacity, 0)
		}

		get currentGuests(): number {
			return this._currentGuests
		}

		seatGuests(count: number): void {
			if (!Number.isInteger(count) || count <= 0) {
				throw new Error("Guest count must be a positive integer")
			}
			if (this._currentGuests + count > this.capacity) {
				throw new Error("Exceeds table capacity")
			}
			this._currentGuests += count
		}
	}

	// TODO completed: Table invariants are enforced by the Entity itself.
	const table = Table.create(5, 4)
	table.seatGuests(3)

	logError(4, "Table state stays valid now", {
		table: {
			tableNumber: table.tableNumber,
			capacity: table.capacity,
			currentGuests: table.currentGuests,
		},
		issue: "currentGuests cannot go below 0 or above capacity.",
	})

	try {
		table.seatGuests(2)
	} catch (error) {
		logError(4, "Now it blocks seating too many guests", (error as Error).message)
	}

	try {
		const emptyTable = Table.create(3, 6)
		emptyTable.seatGuests(-2)
	} catch (error) {
		logError(4, "Now it blocks negative guest count", (error as Error).message)
	}
}
