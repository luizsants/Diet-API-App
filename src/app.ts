import fastify from "fastify";
import cookie from '@fastify/cookie'
import { mealsRegister } from "./routes/meals";
import { createNewUser } from "./routes/newUser";


export const app = fastify()

app.register(cookie)
app.register(createNewUser)

app.register(mealsRegister, {
    prefix: 'meals',
})


