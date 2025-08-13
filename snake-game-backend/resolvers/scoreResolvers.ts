import { Score } from '../types/score';
import pool from '../db';
import { User } from '../types/user';

// Score resolvers - This handles score-related queries and mutations
export const scoreResolvers = {

  // Queries for getting a single score based on ID and a list of all scores
  Query: {
    score: async (_: Score, { id }: { id: string }) => {
      // Try to fetch the score by ID from the database
      try {
        const result = await pool.query(`
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
          } as User
        } as Score;
      } catch (error) {
        throw new Error(`Failed to fetch score: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    scores: async () => {
      // Try to fetch all scores from the database
      try {
        const result = await pool.query(`
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
          } as User
        } as Score
      ));
      } catch (error) {
        throw new Error(`Failed to fetch scores: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  },

  Mutation: {
    createScore: async (_: Score, { userId, value }: { userId: string; value: number }) => {
      try {
        // First check if user exists
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
          throw new Error('User not found');
        }

        // Insert new score
        const result = await pool.query(
          'INSERT INTO scores (user_id, value) VALUES ($1, $2) RETURNING *',
          [userId, value]
        );

        const newScore = result.rows[0];
        const user = userResult.rows[0];

        return {
          id: newScore.id,
          value: newScore.value,
          user: {
            id: user.id,
            username: user.username,
            password_hash: user.password_hash
          } as User
        } as Score;
      } catch (error) {
        throw new Error(`Failed to create score: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    updateScore: async (_: Score, { id, value }: { id: string; value: number }) => {
      try {
        // Update the score
        const result = await pool.query(
          `UPDATE scores SET value = $1 WHERE id = $2 RETURNING *`,
          [value, id]
        );

        if (result.rows.length === 0) {
          throw new Error('Score not found');
        }

        // Get the user information
        const userResult = await pool.query(
          'SELECT * FROM users WHERE id = $1',
          [result.rows[0].user_id]
        );

        const updatedScore = result.rows[0];
        const user = userResult.rows[0];

        return {
          id: updatedScore.id,
          value: updatedScore.value,
          user: {
            id: user.id,
            username: user.username,
            password_hash: user.password_hash
          } as User
        } as Score;
      } catch (error) {
        throw new Error(`Failed to update score: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }
};