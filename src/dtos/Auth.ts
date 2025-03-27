import { User } from "@/interfaces/User";

export interface LoginResponseDTO {
    token: string;
    user: User;
  }