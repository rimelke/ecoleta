import { Request, Response } from 'express'
import knex from '../database/connection'

export default {
    async index(req: Request, res: Response) {
        const { city, uf, items } = req.query

        const parsedItems = String(items).split(',').map(item_id => Number(item_id.trim()))

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*')

        const parsedPoints = points.map(point => {
            point.image_url = `http://192.168.8.15:3333/uploads/${point.image}`
            return point
        })
        
        res.json(parsedPoints)
    },

    async show(req: Request, res: Response) {
        let { id } = req.params
        let point = await knex('points').where('id', id).first()
        if (point) {
            let pointItems = await knex('items')
                .join('point_items', 'items.id', '=', 'point_items.item_id')
                .where('point_items.point_id', id).select('title')
            
            point.items = pointItems
            point.image_url = `http://192.168.8.15:3333/uploads/${point.image}`
            res.json(point)
        } else res.status(400).json({message: "Point not found!"})
    },

    async create(req: Request, res: Response) {
        let {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = req.body

        const point = {
            image: req.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }
        try {
            const trx = await knex.transaction()

            const insertedIds = await trx('points').insert(point)

            const point_id = insertedIds[0]

            const pointItems = items.split(',').map((item: string) => Number(item.trim()) ).map((item_id: number) => {
                return {point_id, item_id}
            })

            await trx('point_items').insert(pointItems)

            await trx.commit()

            res.json({id: point_id, ...point})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Error!'})
        }
    }
}