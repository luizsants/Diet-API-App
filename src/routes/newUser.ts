import { knex } from "../database"
import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
export async function createNewUser(app: FastifyInstance) {
    app.post('/newUser', async (req, reply) => { 
        const sessionId = randomUUID()
        reply.cookie('sessionId', sessionId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        })
        return reply.status(201).send()
    })
    // route passing on test
}