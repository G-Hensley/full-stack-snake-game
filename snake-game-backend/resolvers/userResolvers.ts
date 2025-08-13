import { User } from "../types/user";
import pool from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const userResolvers = {
  Query: {
    user: async (_: any, __: any, context: any) => {
      // This would typically get user from JWT token in context
      // For now, let's get the first user as an example
      try {
        const result = await pool.query('SELECT * FROM users LIMIT 1');
        return result.rows[0];
      } catch (error) {
        throw new Error('Failed to fetch user');
      }
    },
    users: async () => {
      try {
        const result = await pool.query('SELECT * FROM users');
        return result.rows;
      } catch (error) {
        throw new Error('Failed to fetch users');
      }
    }
  },

  Mutation: {
    createUser: async (_: any, { username, password }: { username: string; password: string }) => {
      try {
        // Check if user already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
          throw new Error('User already exists');
        }

        // Hash the password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await pool.query(
          'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *',
          [username, password_hash]
        );

        return result.rows[0];
      } catch (error) {
        throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    login: async (_: any, { username, password }: { username: string; password: string }) => {
      try {
        // Find user
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
          throw new Error('User not found');
        }

        const user = result.rows[0];

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
          throw new Error('Invalid password');
        }

        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id, username: user.username },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        );

        return token;
      } catch (error) {
        throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }
};