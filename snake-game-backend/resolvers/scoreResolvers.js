"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreResolvers = void 0;
const db_1 = __importDefault(require("../db"));
// Score resolvers - This handles score-related queries and mutations
exports.scoreResolvers = {
    // Queries for getting a single score based on ID and a list of all scores
    Query: {
        score: async (_, { id }) => {
            // Try to fetch the score by ID from the database
            try {
                const result = await db_1.default.query(`
          SELECT s.*, u.username, u.password_hash 
          FROM scores s 
          JOIN users u ON s.user_id = u.id 
          WHERE s.id = $1
        `, [id]);
                if (result.rows.length === 0) {
                    return null;
                }
                const row = result.rows[0];
                // Map the database row to the Score type
                return {
                    id: row.id,
                    value: row.value,
                    user: {
                        id: row.user_id,
                        username: row.username,
                        password_hash: row.password_hash
                    }
                };
            }
            catch (error) {
                throw new Error(`Failed to fetch score: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        scores: async () => {
            // Try to fetch all scores from the database
            try {
                const result = await db_1.default.query(`
          SELECT s.*, u.username, u.password_hash 
          FROM scores s 
          JOIN users u ON s.user_id = u.id 
          ORDER BY s.value DESC
        `);
                return result.rows.map(row => ({
                    id: row.id,
                    value: row.value,
                    user: {
                        id: row.user_id,
                        username: row.username,
                        password_hash: row.password_hash
                    }
                }));
            }
            catch (error) {
                throw new Error(`Failed to fetch scores: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    },
    Mutation: {
        createScore: async (_, { userId, value }) => {
            try {
                // First check if user exists
                const userResult = await db_1.default.query('SELECT * FROM users WHERE id = $1', [userId]);
                if (userResult.rows.length === 0) {
                    throw new Error('User not found');
                }
                // Insert new score
                const result = await db_1.default.query('INSERT INTO scores (user_id, value) VALUES ($1, $2) RETURNING *', [userId, value]);
                const newScore = result.rows[0];
                const user = userResult.rows[0];
                return {
                    id: newScore.id,
                    value: newScore.value,
                    user: {
                        id: user.id,
                        username: user.username,
                        password_hash: user.password_hash
                    }
                };
            }
            catch (error) {
                throw new Error(`Failed to create score: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        updateScore: async (_, { id, value }) => {
            try {
                // Update the score
                const result = await db_1.default.query(`UPDATE scores SET value = $1 WHERE id = $2 RETURNING *`, [value, id]);
                if (result.rows.length === 0) {
                    throw new Error('Score not found');
                }
                // Get the user information
                const userResult = await db_1.default.query('SELECT * FROM users WHERE id = $1', [result.rows[0].user_id]);
                const updatedScore = result.rows[0];
                const user = userResult.rows[0];
                return {
                    id: updatedScore.id,
                    value: updatedScore.value,
                    user: {
                        id: user.id,
                        username: user.username,
                        password_hash: user.password_hash
                    }
                };
            }
            catch (error) {
                throw new Error(`Failed to update score: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    }
};
