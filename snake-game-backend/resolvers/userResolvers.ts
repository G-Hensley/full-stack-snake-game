import { User } from "../types/user";

export const userResolvers = (user?: User) => ({
  Query: {
    user: {
      id: user?.id,
      username: user?.username,
      password_hash: user?.password_hash
    }
  },

  Mutation: {
    createUser: (parent: any, { input }: { input: User }) => {
      const newUser = {
        username: input.username,
        password_hash: input.password_hash
      };
      // Logic to save the new user to the database
      return newUser;
    }
  }
});