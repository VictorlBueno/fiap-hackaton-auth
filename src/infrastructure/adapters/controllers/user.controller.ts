import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { GetUserEmailUseCase } from '../../../application/usecases/get-user-email.usecase';

@Controller('users')
export class UserController {
  constructor(private readonly getUserEmailUseCase: GetUserEmailUseCase) {}

  @Get(':userSub/email')
  async getUserEmail(@Param('userSub') userSub: string) {
    try {
      const email = await this.getUserEmailUseCase.execute(userSub);
      
      return {
        success: true,
        email: email,
      };
    } catch (error) {
      const message = error.message || 'Erro interno do servidor';
      
      if (message.includes('Sub é obrigatório')) {
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      }
      
      if (message.includes('Usuário não encontrado')) {
        throw new HttpException(message, HttpStatus.NOT_FOUND);
      }
      
      if (message.includes('Muitas tentativas')) {
        throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
      }
      
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 