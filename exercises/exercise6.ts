import { logError } from "./logger.js"

//============================================================================
// EXERCISE 6: Temporal Logic Error - Operating Hours
//
// ANTI-PATTERN: Representing domain-specific time concepts as raw numbers.
// Two problems: (1) invalid values (25, -5) are accepted, and (2) the
// business logic for "is the restaurant open?" is wrong for overnight spans.
//
// DDD FIX: Encapsulate the concept of "operating hours" in a Value Object
// that owns its own validation AND its own logic.
//
// HINT - Value Object with behavior:
//   type Hour = number & { readonly __brand: unique symbol }
//   function createHour(h: number): Hour {
//       if (!Number.isInteger(h) || h < 0 || h > 23)
//           throw new Error("Hour must be 0-23")
//       return h as Hour
//   }
//
//   class OperatingHours {
//       private constructor(
//           public readonly opens: Hour,
//           public readonly closes: Hour,
//       ) {}
//
//       static create(opens: number, closes: number): OperatingHours {
//           return new OperatingHours(createHour(opens), createHour(closes))
//       }
//
//       isOpenAt(hour: Hour): boolean {
//           // Handles midnight crossover correctly
//           if (this.opens <= this.closes) {
//               return hour >= this.opens && hour < this.closes
//           }
//           return hour >= this.opens || hour < this.closes
//       }
//   }
//
// KEY INSIGHT: In DDD, domain logic lives inside the domain objects, not in
// external utility functions. OperatingHours knows how to answer "am I open?"
// because that question is part of its domain responsibility.
// ============================================================================

export function exercise6_TemporalLogic() {
	type Hour = number & { readonly __brand: unique symbol }

	const createHour = (value: number): Hour => {
		if (!Number.isInteger(value) || value < 0 || value > 23) {
			throw new Error("Hour must be an integer between 0 and 23")
		}
		return value as Hour
	}

	class OperatingHours {
		private constructor(
			public readonly opens: Hour,
			public readonly closes: Hour,
		) {}

		static create(opens: number, closes: number): OperatingHours {
			return new OperatingHours(createHour(opens), createHour(closes))
		}

		isOpenAt(hour: Hour): boolean {
			if (this.opens <= this.closes) {
				return hour >= this.opens && hour < this.closes
			}
			return hour >= this.opens || hour < this.closes
		}
	}

	type Restaurant = {
		name: string
		operatingHours: OperatingHours
	}

	const restaurant: Restaurant = {
		name: "Joe's Diner",
		operatingHours: OperatingHours.create(22, 6), // Opens at 10 PM, closes at 6 AM
	}

	// TODO completed: operating hour validation and open/closed logic now
	// live inside OperatingHours.
	const testHour = createHour(2)

	logError(6, "Overnight open and close check works now", {
		restaurant: {
			name: restaurant.name,
			opensAt: restaurant.operatingHours.opens,
			closesAt: restaurant.operatingHours.closes,
		},
		testHour,
		isOpenCalculated: restaurant.operatingHours.isOpenAt(testHour), // true
		issue: "Cross-midnight logic is handled in one place.",
	})

	try {
		const brokenRestaurant: Restaurant = {
			name: "Broken Cafe",
			operatingHours: OperatingHours.create(25, -5),
		}
		logError(6, "It accepted invalid hours (this should not happen)", {
			restaurant: brokenRestaurant,
		})
	} catch (error) {
		logError(6, "Now invalid hours throw during creation", (error as Error).message)
	}
}
