import { beforeEach, beforeAll, afterAll, describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('meals routes', () => {
    beforeAll(async () => {
        await app.ready()
    })
    afterAll(async () => {
        await app.close()
    })
    beforeEach(() => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })
    it("should be able to create a new user", async () => {
        await request(app.server)
            .post('/newUser')
            .send().expect(201)
    })
    it("sould be able to create a new meal", async () => {
        const createNewUser = await request(app.server)
            .post('/newUser')
            .send()
        const cookies = createNewUser.get('Set-Cookie') ?? []

        await request(app.server).post('/meals')
            .send({
                title: "New Meal of TESTE",
                description: "New Description of TESTE",
                made_at: "2024-10-26T14:48:00.000Z",
                isOnDiet: true
            }).set('Cookie', cookies).expect(201)
        await request(app.server).post('/meals')
            .send({
                title: "New Meal of TESTE",
                description: "New Description of TESTE",
                made_at: "01/01/2000",
                isOnDiet: true
            }).set('Cookie', cookies).expect(201)
    })
    it("sould be able to get a specif meal", async () => {
        const createNewUser = await request(app.server)
            .post('/newUser')
            .send()
        const cookies = createNewUser.get('Set-Cookie') ?? []
        await request(app.server).post('/meals')
            .send({
                title: "New Meal",
                description: "New Description",
                made_at: "2024-10-26T14:48:00.000Z",
                isOnDiet: true
            }).set('Cookie', cookies)

        const listMeals = await request(app.server).get('/meals').set("Cookie", cookies).expect(200)
        const mealId = listMeals.body.meals[0].id
        const getMealRes = await request(app.server).get(`/meals/${mealId}`).set('Cookie', cookies).expect(200)

        expect(getMealRes.body.meals[0]).toEqual(
            expect.objectContaining({
                title: "New Meal",
                description: "New Description",
            })
        )
    })
    it("should be able to get all meals", async () => {
        const createNewUser = await request(app.server)
            .post('/newUser')
            .send();
        const cookies = createNewUser.get('Set-Cookie') ?? [];
        await request(app.server).post('/meals')
            .send({
                title: "New Meal",
                description: "New Description",
                made_at: "2024-10-26T14:48:00.000Z",
                isOnDiet: true,
            }).set('Cookie', cookies);
        await request(app.server).post('/meals')
            .send({
                title: "New Meal",
                description: "New Description",
                made_at: "10/05/2023",
                isOnDiet: true,
            }).set('Cookie', cookies);
        const listMeals = await request(app.server).get('/meals').set("Cookie", cookies).expect(200);
        expect(listMeals.body.meals[0]).toEqual(
            expect.objectContaining({
                title: "New Meal",
                description: "New Description",
            })
        );
        expect(listMeals.body.meals[1]).toEqual(
            expect.objectContaining({
                title: "New Meal",
                description: "New Description",
            })
        );
    });
    it("sould be able to edit the values of a meal", async () => {
        const createNewUser = await request(app.server)
            .post('/newUser')
            .send()
        const cookies = createNewUser.get('Set-Cookie') ?? []
        await request(app.server).post('/meals')
            .send({
                title: "New Meal",
                description: "New Description",
                made_at: "2024-10-26T14:48:00.000Z",
                isOnDiet: true
            }).set('Cookie', cookies)

        const listMeals = await request(app.server).get('/meals').set("Cookie", cookies).expect(200)
        const mealId = listMeals.body.meals[0].id
        const getMealRes = await request(app.server).get(`/meals/${mealId}`).set('Cookie', cookies).expect(200)

        expect(getMealRes.body.meals[0]).toEqual(
            expect.objectContaining({
                title: "New Meal",
                description: "New Description",
            })
        )
        await request(app.server).patch(`/meals/${mealId}`).send({
            title: "altered by test file",
            description: "altered by test file",
            made_at: "01/02/2003"
        }).set('Cookie', cookies).expect(204)
        await request(app.server).patch(`/meals/${mealId}`).send({
            title: "altered by test file",
            description: "altered by test file",
            made_at: "2021-10-26T14:48:00.000Z"
        }).set('Cookie', cookies).expect(204)
    })
    it("sould be able to delete a specif meal", async () => {
        const createNewUser = await request(app.server)
            .post('/newUser')
            .send()
        const cookies = createNewUser.get('Set-Cookie') ?? []
        await request(app.server).post('/meals')
            .send({
                title: "New Meal",
                description: "New Description",
                made_at: "2024-10-26T14:48:00.000Z",
                isOnDiet: true
            }).set('Cookie', cookies)

        const listMeals = await request(app.server).get('/meals').set("Cookie", cookies).expect(200)
        const mealId = listMeals.body.meals[0].id
        await request(app.server).delete(`/meals/${mealId}`).set('Cookie', cookies).expect(200)

    })
    it("should be able to get the best sequence on diet", async () => {
        const createNewUser = await request(app.server)
            .post('/newUser')
            .send();
        const cookies = createNewUser.get('Set-Cookie') ?? [];
        for (let i = 1; i <= 10; i++) {
            await request(app.server).post('/meals')
                .send({
                    title: `Diet Meal ${i}`,
                    description: `Description for Diet Meal ${i}`,
                    made_at: `2024-10-26T14:48:00.000Z`,
                    isOnDiet: true,
                }).set('Cookie', cookies);
        }
        await request(app.server).post('/meals')
            .send({
                title: "Cheat Meal",
                description: "Description for Cheat Meal",
                made_at: "2024-10-26T14:48:00.000Z",
                isOnDiet: false,
            }).set('Cookie', cookies);
        for (let i = 11; i <= 13; i++) {
            await request(app.server).post('/meals')
                .send({
                    title: `Diet Meal ${i}`,
                    description: `Description for Diet Meal ${i}`,
                    made_at: `2024-10-26T14:48:00.000Z`, // Same date for simplicity
                    isOnDiet: true,
                }).set('Cookie', cookies);
        }

        const bestSequence = await request(app.server).get('/meals/bestSequence').set("Cookie", cookies).expect(200);
        expect(bestSequence.body).toEqual(
            expect.objectContaining({
                bestSequence: expect.any(Number)
            })
        );
        expect(bestSequence.body.bestSequence).toBe(10);

    });
    it("should be able to get the total of meals registered", async () => {
        const createNewUser = await request(app.server)
            .post('/newUser')
            .send();
        const cookies = createNewUser.get('Set-Cookie') ?? [];
        for (let i = 1; i <= 20; i++) {
            await request(app.server).post('/meals')
                .send({
                    title: `Diet Meal ${i}`,
                    description: `Description for Diet Meal ${i}`,
                    made_at: `2024-10-26T14:48:00.000Z`,
                    isOnDiet: true,
                }).set('Cookie', cookies);
        }

        const bestSequence = await request(app.server).get('/meals/mealQuantity').set("Cookie", cookies).expect(200);
        expect(bestSequence.body).toEqual(
            expect.objectContaining({
                count: expect.any(Number)
            })
        );
        expect(bestSequence.body.count).toBe(20);

    });
    it("should be able to get the total of meals on diet", async () => {
        const createNewUser = await request(app.server)
            .post('/newUser')
            .send();
        const cookies = createNewUser.get('Set-Cookie') ?? [];
        for (let i = 1; i <= 5; i++) {
            await request(app.server).post('/meals')
                .send({
                    title: `Diet Meal ${i}`,
                    description: `Description for Diet Meal ${i}`,
                    made_at: `2024-10-26T14:48:00.000Z`,
                    isOnDiet: true,
                }).set('Cookie', cookies);
        }
        for (let i = 1; i <= 3; i++) {
            await request(app.server).post('/meals')
                .send({
                    title: `Diet Meal ${i}`,
                    description: `Description for Diet Meal ${i}`,
                    made_at: `2024-10-26T14:48:00.000Z`,
                    isOnDiet: false,
                }).set('Cookie', cookies);
        }
        

        const bestSequence = await request(app.server).get('/meals/mealQuantityOnDiet').set("Cookie", cookies).expect(200);
        expect(bestSequence.body).toEqual(
            expect.objectContaining({
                count: expect.any(Number)
            })
        );
        expect(bestSequence.body.count).toBe(5);

    });
    it("should be able to get the total of meals out of diet", async () => {
        const createNewUser = await request(app.server)
            .post('/newUser')
            .send();
        const cookies = createNewUser.get('Set-Cookie') ?? [];
        for (let i = 1; i <= 5; i++) {
            await request(app.server).post('/meals')
                .send({
                    title: `Diet Meal ${i}`,
                    description: `Description for Diet Meal ${i}`,
                    made_at: `2024-10-26T14:48:00.000Z`,
                    isOnDiet: false,
                }).set('Cookie', cookies);
        }
        for (let i = 1; i <= 3; i++) {
            await request(app.server).post('/meals')
                .send({
                    title: `Diet Meal ${i}`,
                    description: `Description for Diet Meal ${i}`,
                    made_at: `2024-10-26T14:48:00.000Z`,
                    isOnDiet: true,
                }).set('Cookie', cookies);
        }

        const bestSequence = await request(app.server).get('/meals/mealQuantityOutOfDiet').set("Cookie", cookies).expect(200);
        expect(bestSequence.body).toEqual(
            expect.objectContaining({
                count: expect.any(Number)
            })
        );
        expect(bestSequence.body.count).toBe(5);

    });
})