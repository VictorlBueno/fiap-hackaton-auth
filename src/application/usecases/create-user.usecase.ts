import { Injectable } from '@nestjs/common';
import { AuthProviderPort, CreateUserData } from '../../domain/ports/gateways/auth-provider.port';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class CreateUserUseCase {
    constructor(private readonly authProvider: AuthProviderPort) {}

    async execute(data: CreateUserData): Promise<User> {
        this.validateInput(data);
        return this.authProvider.createUser(data);
    }

    private validateInput(data: CreateUserData): void {
        if (!data.email || !this.isValidEmail(data.email)) {
            throw new Error('Email inválido');
        }

        if (!data.password || data.password.length < 8) {
            throw new Error('Senha deve ter pelo menos 8 caracteres');
        }

        if (!data.name || data.name.trim().length < 2) {
            throw new Error('Nome deve ter pelo menos 2 caracteres');
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}