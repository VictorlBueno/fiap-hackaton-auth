import { Injectable, Inject } from '@nestjs/common';
import { AuthProviderPort } from '../../domain/ports/gateways/auth-provider.port';

@Injectable()
export class GetUserEmailUseCase {
  constructor(
    @Inject(AuthProviderPort)
    private readonly authProvider: AuthProviderPort,
  ) {}

  async execute(userSub: string): Promise<string> {
    if (!userSub) {
      throw new Error('Sub é obrigatório');
    }

    try {
      const user = await this.authProvider.getUserBySub(userSub);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      return user.email;
    } catch (error: any) {
      if (error.message === 'Usuário não encontrado') {
        throw error;
      }

      if (error.name === 'ResourceNotFoundException') {
        throw new Error('Usuário não encontrado');
      }

      if (error.name === 'TooManyRequestsException') {
        throw new Error('Muitas tentativas. Tente novamente mais tarde');
      }

      throw new Error('Erro do Cognito: Erro desconhecido do Cognito');
    }
  }
} 