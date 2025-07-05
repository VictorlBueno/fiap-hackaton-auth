import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
    @ApiProperty({
        description: 'Token de acesso JWT',
        example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    accessToken: string;

    @ApiProperty({
        description: 'Token de refresh para renovação',
        example: 'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ...'
    })
    refreshToken: string;

    @ApiProperty({
        description: 'Token de identidade com informações do usuário',
        example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IlVzZXJQb29sX2lkIiwidHlwIjoiSldUIn0...'
    })
    idToken: string;

    @ApiProperty({
        example: 3600,
        description: 'Tempo de expiração em segundos',
        type: 'number'
    })
    expiresIn: number;

    @ApiProperty({
        example: 'Bearer',
        description: 'Tipo do token',
        enum: ['Bearer']
    })
    tokenType: string;
}