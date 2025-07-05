import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
    @ApiProperty({
        example: 'uuid-4',
        description: 'ID único do usuário'
    })
    id: string;

    @ApiProperty({
        example: 'user@example.com',
        description: 'Email do usuário'
    })
    email: string;

    @ApiProperty({
        example: 'João Silva',
        description: 'Nome do usuário'
    })
    name: string;

    @ApiProperty({
        example: '2024-01-01T00:00:00Z',
        description: 'Data de criação',
        type: 'string',
        format: 'date-time'
    })
    createdAt: Date;

    @ApiProperty({
        example: true,
        description: 'Email verificado',
        type: 'boolean'
    })
    isEmailVerified: boolean;
}