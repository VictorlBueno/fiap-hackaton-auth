import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { CreateUserUseCase } from '../../../application/usecases/create-user.usecase';
import { LoginUserUseCase } from '../../../application/usecases/login-user.usecase';
import { User } from '../../../domain/entities/user.entity';
import { AuthResult } from '../../../domain/entities/auth-result.entity';
import {
  AuthControllerPort,
  CreateUserRequest,
  LoginRequest,
} from '../../../domain/ports/controllers/auth.port';

class CreateUserDto implements CreateUserRequest {
  @ApiProperty({ example: 'user@example.com', description: 'Email do usuário' })
  @IsEmail({}, { message: 'Email deve ter formato válido' })
  email: string;

  @ApiProperty({
    example: 'MinhaSenh@123',
    description: 'Senha (mínimo 8 caracteres)',
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  password: string;

  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do usuário',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  name: string;
}

class LoginDto implements LoginRequest {
  @ApiProperty({ example: 'user@example.com', description: 'Email do usuário' })
  @IsEmail({}, { message: 'Email deve ter formato válido' })
  email: string;

  @ApiProperty({ example: 'MinhaSenh@123', description: 'Senha do usuário' })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  password: string;
}

class UserResponseDto {
  @ApiProperty({ example: 'uuid-4', description: 'ID único do usuário' })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email do usuário' })
  email: string;

  @ApiProperty({ example: 'João Silva', description: 'Nome do usuário' })
  name: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Data de criação',
  })
  createdAt: Date;

  @ApiProperty({ example: true, description: 'Email verificado' })
  isEmailVerified: boolean;
}

class AuthResponseDto {
  @ApiProperty({ description: 'Token de acesso JWT' })
  accessToken: string;

  @ApiProperty({ description: 'Token de refresh' })
  refreshToken: string;

  @ApiProperty({ description: 'Token de identidade' })
  idToken: string;

  @ApiProperty({ example: 3600, description: 'Tempo de expiração em segundos' })
  expiresIn: number;

  @ApiProperty({ example: 'Bearer', description: 'Tipo do token' })
  tokenType: string;
}

class ErrorResponseDto {
  @ApiProperty({ example: 400, description: 'Código de status HTTP' })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request', description: 'Mensagem de erro' })
  message: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Timestamp do erro',
  })
  timestamp: string;

  @ApiProperty({
    example: '/auth/register',
    description: 'Caminho da requisição',
  })
  path: string;
}

@ApiTags('Autenticação')
@Controller('auth')
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
    description: 'Dados inválidos ou usuário já existe',
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
