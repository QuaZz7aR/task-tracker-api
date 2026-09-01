import {pool} from './db.js'
import express from 'express'
import {z} from 'zod'
import bcrypt from 'bcrypt'

function isPgError(err: unknown): err is {code: string}{
    return typeof err === 'object' && err !== null && 'code' in err
}

const registeredSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
})

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running');
})

app.post('/register', async (req, res) => {
    const parsed = registeredSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({error: parsed.error.issues});
    }

    const {email, password} = parsed.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
            [email, hashedPassword]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (isPgError(err) && err.code === '23505') {
            res.status(409).json({error: 'Email already exists'});
        }
        res.status(500).json({error: "Internal Server Error"});
    }
})

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
})