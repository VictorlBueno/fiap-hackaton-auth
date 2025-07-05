import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GetUserEmailUseCase } from '../../../application/usecases/get-user-email.usecase';

@Controller('users')
export class UserController {
  constructor(private readonly getUserEmailUseCase: GetUserEmailUseCase) {}

  @Get(':userSub/email')
  async getUserEmail(@Param('userSub') userSub: string) {
    const result = await this.getUserEmailUseCase.execute(userSub);
    
    if (!result.success) {
      return {
        success: false,
        message: result.message,
      };
    }

    return {
      success: true,
      email: result.email,
    };
  }
} 