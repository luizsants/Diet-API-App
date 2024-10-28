import { knex } from '../database';
import { z } from 'zod'

export async function getBestDietSequence(sessionId: string): Promise<number> {
    const meals = await knex('meals')
        .where('session_id', sessionId)
        .select('isOnDiet')
        .orderBy('made_at');
    const mealSchema = z.object({
        isOnDiet: z.preprocess((arg) => arg === 1, z.boolean())
    });
    try {
        const validatedMeals = meals.map(meal => mealSchema.parse(meal));

        let bestSequence = 0;
        let currentSequence = 0;

        validatedMeals.forEach(meal => {
            if (meal.isOnDiet) {
                currentSequence++;
            } else {
                if (currentSequence > bestSequence) {
                    bestSequence = currentSequence;
                }
                currentSequence = 0;
            }
        });
        if (currentSequence > bestSequence) {
            bestSequence = currentSequence;
        }

        return bestSequence;
    } catch (error) {
        console.error("Validation error:", error);
        return 0
    }


}
