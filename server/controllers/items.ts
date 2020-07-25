import { Request, Response } from 'express'
import knex from '../database/connection'

export default {
    async index(req: Request, res: Response) {
        let items = await knex('items')
        let parsedItems = items.map(item => {
            item.image_url = `http://192.168.8.15:3333/uploads/${item.image}`
            return item
        })
        res.json(parsedItems)
    }
}