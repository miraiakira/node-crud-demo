import { Response, Request, NextFunction } from 'express'
import { Todo, TodoWithId, Todos } from './todos.model'
import { ParamsWithId } from '../../interfaces/paramsWithId'
import { ObjectId } from 'mongodb'

export const findAll = async (
  req: Request,
  res: Response<TodoWithId[]>,
  next: NextFunction
) => {
  try {
    const todos = await Todos.find().toArray()
    res.json(todos)
  } catch (error) {
    next(error)
  }
}

export const createOne = async (
  req: Request<{}, TodoWithId, Todo>,
  res: Response<TodoWithId>,
  next: NextFunction
) => {
  try {
    const insertResult = await Todos.insertOne(req.body)
    if (!insertResult.acknowledged) throw new Error('Error inserting todo')
    res.status(201)
    res.json({
      _id: insertResult.insertedId,
      ...req.body
    })
  } catch (error) {
    next(error)
  }
}

export const findOne = async (
  req: Request<ParamsWithId, TodoWithId, {}>,
  res: Response<TodoWithId>,
  next: NextFunction
) => {
  try {
    const result = await Todos.findOne({
      _id: new ObjectId(req.params.id)
    })
    if (!result) {
      res.status(404)
      throw new Error(`Todo with id "${req.params.id}" not found.`)
    }
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export const updateOne = async (
  req: Request<ParamsWithId, TodoWithId, Todo>,
  res: Response<TodoWithId>,
  next: NextFunction
) => {
  try {
    const result = await Todos.findOneAndUpdate(
      {
        _id: new ObjectId(req.params.id)
      },
      {
        $set: req.body
      },
      {
        returnDocument: 'after'
      }
    )
    if (!result?._id) {
      res.status(404)
      throw new Error(`Todo with id "${req.params.id}" not found`)
    }
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export const deleteOne = async (
  req: Request<ParamsWithId>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await Todos.findOneAndDelete({
      _id: new ObjectId(req.params.id)
    })
    if (!result?._id) {
      res.status(404)
      throw new Error(`Todo with id "${req.params.id}" not found`)
    }
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}
