import { Injectable } from '@nestjs/common';
import { AuthProviderPort, CreateUserData } from '../../domain/ports/gateways/auth-provider.port';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class CreateUserUseCase {
    constructor(private readonly authProvider: AuthProviderPort) {}

    async execute(data: CreateUserData): Promise<User> {
        this.validateInput(data);
        try {
            return await this.authProvider.createUser(data);
        } catch (error: any) {
            if (error.message === 'Erro desconhecido do Cognito') {
                throw new Error('Erro do Cognito: Erro desconhecido do Cognito');
            }
            throw error;
        }
    }

    private validateInput(data: CreateUserData): void {
        if (!data.name) {
            throw new Error('Nome é obrigatório');
        }

        if (data.name.trim().length < 2) {
            throw new Error('Nome deve ter pelo menos 2 caracteres');
        }

        if (!data.email) {
            throw new Error('E-mail é obrigatório');
        }

        if (!this.isValidEmail(data.email)) {
            throw new Error('E-mail inválido');
        }

        if (!data.password) {
            throw new Error('Senha é obrigatória');
        }

        if (data.password.length < 8) {
            throw new Error('Senha deve ter pelo menos 8 caracteres');
        }

        if (data.password.length > 128) {
            throw new Error('Senha deve ter no máximo 128 caracteres');
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}