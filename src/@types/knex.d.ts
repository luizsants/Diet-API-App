import { knex } from 'knex'

declare module 'knex/types/tables' {
    export interface Tables {
        meals:{
            id: string
            title: string
            description: string
            made_at: Date
            isOnDiet: boolean
            session_id: string
        }
    }
}