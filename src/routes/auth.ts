import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {loginSchema, registeredSchema} from "../zodSchemas/schemas.js";
import {isPgError} from "../typeChecks/errorTypes.js";
import {pool} from '../db.js'
import {Router} from "express";

const router = Router();

router.post('/register', async (req, res) => {
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

router.post('/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({error: parsed.error.issues});
    }

    const {email, password} = parsed.data;

    const result = await pool.query(`SELECT *
                                     FROM users
                                     WHERE email = $1`, [email]);
    const user = result.rows[0];

    if (!user) {
        return res.status(401).json({error: 'Invalid email or password'});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({error: 'Invalid email or password'});
    }

    const token = jwt.sign(
        {userId: user.id},
        process.env.JWT_SECRET!,
        {expiresIn: '1h'}
    );

    res.json({token});
})

export default router;