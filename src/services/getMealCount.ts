import { knex } from "../database";

export async function getMealCount(sessionId: string, isOnDiet: boolean | null): Promise<number> {
    const query = knex('meals').where("session_id", sessionId);
    if (isOnDiet !== null) {
        query.where('isOnDiet', isOnDiet);
    }
    const numberOfMeals = await query.count({ count: "*" });
    const countValue = numberOfMeals[0]?.count ?? 0;
    return Number(countValue);
}
