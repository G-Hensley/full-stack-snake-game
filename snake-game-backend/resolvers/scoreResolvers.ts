export const scoreResolvers = (score?) => ({
  Query: {
    score: {
      id: score?.id,
      user: {
        id: score?.user?.id,
        username: score?.user?.username,
        password_hash: score?.user?.password_hash
      },
      value: score?.value
    }
  },

  Mutation: {
    createScore: (parent, { input }) => {
      const newScore = {
        user: {
          id: input.user.id,
          username: input.user.username,
          password_hash: input.user.password_hash
        },
        value: input.value
      };
      // Logic to save the new score to the database
      return newScore;
    },
    updateScore: (parent, { id, value }) => {
      const updatedScore = {
        id,
        user: {
          id: value.user.id,
          username: value.user.username,
          password_hash: value.user.password_hash
        },
        value: value.value
      };
      // Logic to update the score in the database
      return updatedScore;
    }
  }
})