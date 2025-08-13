export type Score = {
  id?: string;
  user?: {
    id?: string;
    username?: string;
    password_hash?: string;
  };
  value?: number;
};