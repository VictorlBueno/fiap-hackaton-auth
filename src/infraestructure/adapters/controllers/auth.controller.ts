import {
  Body,
  ClassSerializerInterceptor,
  Controller, HttpCode,
  HttpException,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateUserUseCase } from '../../../application/usecases/create-user.usecase';
import { LoginUserUseCase } from '../../../application/usecases/login-user.usecase';
import { User } from '../../../domain/entities/user.entity';
import { AuthResult } from '../../../domain/entities/auth-result.entity';
import {
  AuthResponseDto,
  CreateUserDto,
  ErrorResponseDto,
  LoginDto,
  UserResponseDto,
} from './dtos';
import { AuthControllerPort } from '../../../domain/ports/controllers/auth.port';

@ApiTags('Autenticação')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController implements AuthControllerPort {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Criar novo usuário',
    description:
      'Cria um novo usuário no AWS Cognito com senha definitiva e email verificado automaticamente',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Usuário já existe',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ErrorResponseDto,
  })
  async createUser(@Body() request: CreateUserDto): Promise<User> {
    try {
      return await this.createUserUseCase.execute(request);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post('login')
  @ApiOperation({
    summary: 'Autenticar usuário',
    description: 'Realiza login do usuário retornando tokens de acesso',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Muitas tentativas de login',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ErrorResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() request: LoginDto): Promise<AuthResult> {
    try {
      return await this.loginUserUseCase.execute(request);
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    const message = error.message || 'Erro interno do servidor';

    if (message.includes('Usuário já existe')) {
      throw new HttpException(message, HttpStatus.CONFLICT);
    }

    if (
      message.includes('inválido') ||
      message.includes('obrigatório') ||
      message.includes('critérios')
    ) {
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }

    if (
      message.includes('Credenciais inválidas') ||
      message.includes('não encontrado')
    ) {
      throw new HttpException(message, HttpStatus.UNAUTHORIZED);
    }

    if (message.includes('Muitas tentativas')) {
      throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
    }

    throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
