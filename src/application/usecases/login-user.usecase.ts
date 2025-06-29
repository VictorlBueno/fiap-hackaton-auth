import { Injectable } from '@nestjs/common';
import { AuthProviderPort, LoginData } from '../../domain/ports/gateways/auth-provider.port';
import { AuthResult } from '../../domain/entities/auth-result.entity';

@Injectable()
export class LoginUserUseCase {
    constructor(private readonly authProvider: AuthProviderPort) {}

    async execute(data: LoginData): Promise<AuthResult> {
        this.validateInput(data);
        return this.authProvider.authenticateUser(data);
    }

    private validateInput(data: LoginData): void {
        if (!data.email || !this.isValidEmail(data.email)) {
            throw new Error('Email inválido');
        }

        if (!data.password) {
            throw new Error('Senha é obrigatória');
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}