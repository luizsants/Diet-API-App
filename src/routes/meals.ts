import { knex } from "../database"
import dayjs from 'dayjs'
import { z } from 'zod'
import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { checkSessionIdExists } from "../middlewares/check-session-id";
import { Params } from "../@types/mealsTypes";
import { getBestDietSequence } from "../services/getBestDietSequence";
import { dateSchema } from "../services/dateSchema";
import { getMealCount } from "../services/getMealCount";

// async function getMealCount(sessionId: string, isOnDiet: boolean | null): Promise<number> {
//     const query = knex('meals').where("session_id", sessionId);
//     if (isOnDiet !== null) {
//         query.where('isOnDiet', isOnDiet);
//     }
//     const numberOfMeals = await query.count({ count: "*" });
//     const countValue = numberOfMeals[0]?.count ?? 0;
//     return Number(countValue);
// }

export async function mealsRegister(app: FastifyInstance) {
    
    // get all meals of the actual user - OK
    app.get('/', {
        preHandler: [checkSessionIdExists]
    }, async (request, reply) => {
        const { sessionId } = request.cookies
        const meals = await knex('meals')
            .where('session_id', sessionId)
            .select()
        const formattedMeals = meals.map(meal => ({
            ...meal,
            formated_date: dayjs(meal.made_at).format('DD-MM-YYYY HH:mm:ss')
        }))
        return reply.status(200).send({ meals: formattedMeals })
    })

    // get a specific meal / commented to get the real cause of the error - OK
    app.get('/:id', {
        preHandler: [checkSessionIdExists]
    }, async (request, reply) => {
        const { sessionId } = request.cookies
        const { id } = request.params as Params
        // Fetch meals that match the given ID
        const meals = await knex('meals')
            .where({ id })
            .select();
        // Check if meals were found
        if (meals.length === 0) {
            // No meal exists with the given ID
            return reply.status(404).send({ message: 'Meal not found' });
        }
        // Check if the meal belongs to the correct session
        const matchingMeals = meals.filter(meal => meal.session_id === sessionId);
        if (matchingMeals.length === 0) {
            // Meal exists but does not belong to the session
            return reply.status(403).send({ message: 'This meal does not belong to your session' });
        }
        // Format the meals for response
        const formattedMeals = matchingMeals.map(meal => ({
            ...meal,
            formated_date: dayjs(meal.made_at).format('DD-MM-YYYY HH:mm:ss')
        }));
        return reply.status(200).send({ meals: formattedMeals });
    })

    // get the meals of all users / route bellow is provisory only for debbuging - Not for Test
    app.get('/all', async () => {
        const meals = await knex('meals').select()
        const formattedMeals = meals.map(meal => ({
            ...meal,
            formated_date: dayjs(meal.made_at).format('DD-MM-YYYY HH:mm:ss')
        }))

        return { meals: formattedMeals }
    })

    // get the best sequence days of diet - OK
    app.get('/bestSequence', {
        preHandler: [checkSessionIdExists]
    }, async (request, reply) => {
        const { sessionId } = request.cookies;
        const bestSequence = await getBestDietSequence(sessionId as string)
        if (bestSequence === 0) {
            return reply.status(404).send({ message: 'No diet sequence found.' });
        }

        return reply.status(200).send({ bestSequence });
    })

    // get metrics of the user - OK
    app.get('/mealQuantity', {
        preHandler: [checkSessionIdExists]
    }, async (request, reply) => {
        const { sessionId } = request.cookies as { sessionId: string }
        const count = await getMealCount(sessionId, null);
        if (count !== 0) {
            return reply.status(200).send({count})
        } else {
            return reply.status(404).send({ message: "No meal registred yet!" })
        }
    })

    // get metrics of the user / quantity and percentage of meals on Diet - OK
    app.get('/mealQuantityOnDiet', {
        preHandler: [checkSessionIdExists]
    }, async (request, reply) => {
        const { sessionId } = request.cookies as { sessionId: string }
        const totalCount = await getMealCount(sessionId, null);
        const onDietCount = await getMealCount(sessionId, true);

        let percentageOnDiet = 0;
        if (totalCount > 0) {
            percentageOnDiet = (onDietCount / totalCount) * 100;
        }
        if (onDietCount !== 0) {

            return reply.status(200).send({
                count: onDietCount,
                percentage: percentageOnDiet.toFixed(2)
            })
        } else {
            return reply.status(404).send({ message: "No meal registred yet!" })
        }
    })

    // get metrics of the user / quantity of meals out of Diet - OK
    app.get('/mealQuantityOutOfDiet', {
        preHandler: [checkSessionIdExists]
    }, async (request, reply) => {
        const { sessionId } = request.cookies as { sessionId: string }
        const count = await getMealCount(sessionId, false);

        if (count !== 0) {
                return reply.status(200).send({count})
        } else {
            return reply.status(404).send({ message: "No meal registred yet!" })
        }
    })

    // delete a specific meal - OK
    app.delete('/:id', {
        preHandler: [checkSessionIdExists]
    }, async (request, reply) => {
        const { sessionId } = request.cookies
        const { id } = request.params as Params
        const deletedMeal = await knex('meals').where({
            session_id: sessionId,
            id: id
        }).del()

        if (deletedMeal) {
            return reply.status(200).send({ message: 'The Data of this user was deleted successfully' })
        } else {
            return reply.status(404).send({ message: 'Meal not found' });
        }

    })

    // delete meals of all users / route bellow is provisory only for debbuging - Not for test
    app.delete('/all', async (request, reply) => {
        await knex('meals').del()
        return reply.status(200).send({ message: 'All the Data was deleted successfully' })

    })

    // update a specific meal - OK
    app.patch('/:id', {
        preHandler: [checkSessionIdExists]
    }, async (request, reply) => {

        const updateMealSchema = z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            made_at: z.preprocess((arg) => {
                return typeof arg === "string" ? new Date(arg) : arg;
            }, z.date()).optional(),
            isOnDiet: z.boolean().optional()
        })
        const { id } = request.params as Params

        try {
            const updates = updateMealSchema.parse(request.body)
            const { sessionId } = request.cookies
            const updatedMeal = await knex('meals').where({
                id: id,
                session_id: sessionId
            }).update(updates)

            if (updatedMeal) {
                return reply.status(204).send();
            } else {
                return reply.status(404).send({ message: 'Meal not found' });
            }

        } catch (error: unknown) {
            console.error('Error in PATCH /:id:', error);

            if (error instanceof Error) {
                return reply.status(400).send({ message: 'Invalid input', error: error.message });
            }

            return reply.status(400).send({ message: 'Invalid input', error: 'Unknown error' });
        }
    })

    // create a new meal on db - OK
    app.post('/', async (request, reply) => {
        const createNewMeal = z.object({
            title: z.string(), description: z.string(),
            made_at: dateSchema, // Parse the string into a Date
            isOnDiet: z.boolean()
        })
        const { title, description, made_at, isOnDiet } = createNewMeal.parse(request.body)

        let sessionId = request.cookies.sessionId
        if (!sessionId) {
            throw new Error("Not able to create a new meal, call route POST:newUser to create a new user!")
        }
        await knex('meals').insert({
            id: randomUUID(),
            title,
            description,
            made_at,
            isOnDiet,
            session_id: sessionId,
        })
        return reply.status(201).send({ message: 'Data inserted successfully' })
    })
}