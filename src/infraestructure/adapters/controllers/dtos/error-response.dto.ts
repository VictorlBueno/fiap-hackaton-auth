import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
    @ApiProperty({
        example: 400,
        description: 'Código de status HTTP',
        enum: [400, 401, 409, 429, 500]
    })
    statusCode: number;

    @ApiProperty({
        example: 'Email deve ter formato válido',
        description: 'Mensagem de erro detalhada'
    })
    message: string;

    @ApiProperty({
        example: '2024-01-01T00:00:00.000Z',
        description: 'Timestamp do erro',
        type: 'string',
        format: 'date-time'
    })
    timestamp: string;

    @ApiProperty({
        example: '/api/v1/auth/register',
        description: 'Caminho da requisição que gerou o erro'
    })
    path: string;
}