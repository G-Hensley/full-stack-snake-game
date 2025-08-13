"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolvers = void 0;
const db_1 = __importDefault(require("../db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.userResolvers = {
    Query: {
        user: async (_, __, context) => {
            // This would typically get user from JWT token in context
            try {
                const result = await db_1.default.query('SELECT * FROM users WHERE id = $1', [context.userId]);
                return result.rows[0];
            }
            catch (error) {
                throw new Error('Failed to fetch user');
            }
        },
        users: async () => {
            try {
                const result = await db_1.default.query('SELECT * FROM users');
                return result.rows;
            }
            catch (error) {
                throw new Error('Failed to fetch users');
            }
        }
    },
    Mutation: {
        createUser: async (_, { username, password }) => {
            try {
                // Check if user already exists
                const existingUser = await db_1.default.query('SELECT * FROM users WHERE username = $1', [username]);
                if (existingUser.rows.length > 0) {
                    throw new Error('User already exists');
                }
                // Hash the password
                const saltRounds = 10;
                const password_hash = await bcrypt_1.default.hash(password, saltRounds);
                // Insert new user
                const result = await db_1.default.query('INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *', [username, password_hash]);
                return result.rows[0];
            }
            catch (error) {
                throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        login: async (_, { username, password }) => {
            try {
                // Find user
                const result = await db_1.default.query('SELECT * FROM users WHERE username = $1', [username]);
                if (result.rows.length === 0) {
                    throw new Error('User not found');
                }
                const user = result.rows[0];
                // Check password
                const isValidPassword = await bcrypt_1.default.compare(password, user.password_hash);
                if (!isValidPassword) {
                    throw new Error('Invalid password');
                }
                // Generate JWT token
                if (!process.env.JWT_SECRET) {
                    throw new Error('JWT_SECRET is not defined');
                }
                const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
                return token;
            }
            catch (error) {
                throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    }
};
