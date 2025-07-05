import { Injectable, Inject } from '@nestjs/common';
import { AuthProviderPort } from '../../domain/ports/gateways/auth-provider.port';

export interface GetUserEmailResponse {
  success: boolean;
  email?: string;
  message?: string;
}

@Injectable()
export class GetUserEmailUseCase {
  constructor(
    @Inject(AuthProviderPort)
    private readonly authProvider: AuthProviderPort,
  ) {}

  async execute(userSub: string): Promise<GetUserEmailResponse> {
    if (!userSub) {
      return {
        success: false,
        message: 'ID do usuário é obrigatório',
      };
    }

    try {
      const user = await this.authProvider.getUserBySub(userSub);
      
      if (!user) {
        return {
          success: false,
          message: 'Usuário não encontrado',
        };
      }

      return {
        success: true,
        email: user.email,
      };
    } catch (error) {
      console.error('Erro ao buscar e-mail do usuário:', error.message);
      return {
        success: false,
        message: 'Erro interno ao buscar e-mail do usuário',
      };
    }
  }
} 