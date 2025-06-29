import {User} from "../../entities/user.entity";
import {AuthResult} from "../../entities/auth-result.entity";

export interface CreateUserRequest {
    email: string;
    password: string;
    name: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export abstract class AuthControllerPort {
    abstract createUser(request: CreateUserRequest): Promise<User>;
    abstract login(request: LoginRequest): Promise<AuthResult>;
}