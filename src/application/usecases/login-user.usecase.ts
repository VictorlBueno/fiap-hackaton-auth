import { Injectable } from '@nestjs/common';
import { AuthProviderPort, LoginData } from '../../domain/ports/gateways/auth-provider.port';
import { AuthResult } from '../../domain/entities/auth-result.entity';

@Injectable()
export class LoginUserUseCase {
    constructor(private readonly authProvider: AuthProviderPort) {}

    async execute(data: LoginData): Promise<AuthResult> {
        this.validateInput(data);
        try {
            return await this.authProvider.authenticateUser(data);
        } catch (error: any) {
            if (error.message === 'Erro desconhecido do Cognito') {
                throw new Error('Erro do Cognito: Erro desconhecido do Cognito');
            }
            throw error;
        }
    }

    private validateInput(data: LoginData): void {
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
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}