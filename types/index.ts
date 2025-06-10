import { User as FirebaseAuthUser } from "firebase/auth";

export interface User extends FirebaseAuthUser {
  freeSearchCount: number;
  giminiApiKey: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}
