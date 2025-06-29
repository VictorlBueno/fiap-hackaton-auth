import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import {CreateUserRequest} from "../../../../domain/ports/controllers/auth.port";

export class CreateUserDto implements CreateUserRequest {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email do usuário',
        format: 'email'
    })
    @IsEmail({}, { message: 'Email deve ter formato válido' })
    email: string;

    @ApiProperty({
        example: 'MinhaSenh@123',
        description: 'Senha (mínimo 8 caracteres)',
        minLength: 8
    })
    @IsString({ message: 'Senha deve ser uma string' })
    @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
    password: string;

    @ApiProperty({
        example: 'João Silva',
        description: 'Nome completo do usuário',
        minLength: 2
    })
    @IsString({ message: 'Nome deve ser uma string' })
    @IsNotEmpty({ message: 'Nome é obrigatório' })
    @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
    name: string;
}