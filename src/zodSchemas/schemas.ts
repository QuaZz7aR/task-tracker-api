import {z} from 'zod'

export const registeredSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
})

export const loginSchema = z.object({
    email: z.email(),
    password: z.string(),
})

export const createTaskSchema = z.object({
    title: z.string().min(1)
})

export const updateTaskSchema = z.object({
    title: z.string().optional(),
    done: z.boolean().optional()
})