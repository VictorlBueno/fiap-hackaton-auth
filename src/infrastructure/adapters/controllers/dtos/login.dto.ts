import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import {LoginRequest} from "../../../../domain/ports/controllers/auth.port";

export class LoginDto implements LoginRequest {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email do usuário',
        format: 'email'
    })
    @IsEmail({}, { message: 'Email deve ter formato válido' })
    email: string;

    @ApiProperty({
        example: 'MinhaSenh@123',
        description: 'Senha do usuário'
    })
    @IsString({ message: 'Senha deve ser uma string' })
    @IsNotEmpty({ message: 'Senha é obrigatória' })
    password: string;
}