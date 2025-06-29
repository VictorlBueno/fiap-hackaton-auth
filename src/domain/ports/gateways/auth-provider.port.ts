import { User } from '../../entities/user.entity';
import { AuthResult } from '../../entities/auth-result.entity';

export interface CreateUserData {
    email: string;
    password: string;
    name: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export abstract class AuthProviderPort {
    abstract createUser(data: CreateUserData): Promise<User>;
    abstract authenticateUser(data: LoginData): Promise<AuthResult>;
}