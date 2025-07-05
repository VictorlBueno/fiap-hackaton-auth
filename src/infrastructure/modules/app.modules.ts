import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';

import {CreateUserUseCase} from '../../application/usecases/create-user.usecase';
import {GetUserEmailUseCase} from '../../application/usecases/get-user-email.usecase';
import {LoginUserUseCase} from '../../application/usecases/login-user.usecase';
import {AuthProviderPort} from '../../domain/ports/gateways/auth-provider.port';
import {AuthController} from '../adapters/controllers/auth.controller';
import {UserController} from '../adapters/controllers/user.controller';
import {getCognitoConfig} from '../config/cognito.config';
import {CognitoAuthProviderAdapter} from "../adapters/gateways/cognito-auth-provider.adapter";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
        }),
    ],
    controllers: [AuthController, UserController],
    providers: [
        CreateUserUseCase,
        GetUserEmailUseCase,
        LoginUserUseCase,
        {
            provide: AuthProviderPort,
            useFactory: () => {
                const config = getCognitoConfig();
                return new CognitoAuthProviderAdapter(config);
            },
        },
    ],
})

export class AppModule {
}