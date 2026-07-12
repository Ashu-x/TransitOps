import { PrismaClient } from '@prisma-client/js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { signupSchema, loginSchema } from './auth.schema.js';

const prisma = new PrismaClient();

export const login = async (req, res, next) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            status: 'success',
            token,
            data: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                status: 'fail',
                errors: error.errors.map(e => ({ field: e.path[0], message: e.message }))
            });
        }
        next(error);
    }
};

export const signup = async (req, res, next) => {
    try {
        const { email, password, role } = signupSchema.parse(req.body);

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ status: 'fail', message: 'Email already in use' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role
            }
        });

        res.status(201).json({
            status: 'success',
            message: 'User created successfully. Please log in.'
        });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                status: 'fail',
                errors: error.errors.map(e => ({ field: e.path[0], message: e.message }))
            });
        }
        next(error);
    }
};