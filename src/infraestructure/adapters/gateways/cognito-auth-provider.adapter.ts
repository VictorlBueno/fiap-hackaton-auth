import { Injectable } from '@nestjs/common';
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  AdminInitiateAuthCommand,
  AdminCreateUserResponse,
  AdminInitiateAuthResponse,
  MessageActionType,
  DeliveryMediumType,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';
import { createHmac } from 'crypto';

import { AuthProviderPort, CreateUserData, LoginData } from '../../../domain/ports/gateways/auth-provider.port';
import { User } from '../../../domain/entities/user.entity';
import { AuthResult } from '../../../domain/entities/auth-result.entity';
import { CognitoConfig } from '../../config/cognito.config';

@Injectable()
export class CognitoAuthProviderAdapter implements AuthProviderPort {
  private readonly client: CognitoIdentityProviderClient;

  constructor(private readonly config: CognitoConfig) {
    this.client = new CognitoIdentityProviderClient({
      region: this.config.region,
    });
  }

  async createUser(data: CreateUserData): Promise<User> {
    try {
      // Debug: Validar configuração
      console.log('🔧 Configuração Cognito:', {
        region: this.config.region,
        userPoolId: this.config.userPoolId,
        clientId: this.config.clientId,
        hasClientSecret: !!this.config.clientSecret,
      });

      // Debug: Validar dados de entrada
      console.log('📝 Dados de entrada:', {
        email: data.email,
        name: data.name,
        passwordLength: data.password.length,
      });

      // 1. Criar usuário no Cognito
      const createUserCommand = new AdminCreateUserCommand({
        UserPoolId: this.config.userPoolId,
        Username: data.email,
        UserAttributes: [
          { Name: 'email', Value: data.email },
          { Name: 'name', Value: data.name },
          { Name: 'email_verified', Value: 'true' },
        ],
        MessageAction: MessageActionType.SUPPRESS,
        TemporaryPassword: data.password,
      });

      console.log('🚀 Enviando comando AdminCreateUser...');
      const createUserResponse: AdminCreateUserResponse = await this.client.send(createUserCommand);
      console.log('✅ Usuário criado com sucesso:', createUserResponse.User?.Username);

      // 2. Definir senha definitiva
      const setPasswordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: this.config.userPoolId,
        Username: data.email,
        Password: data.password,
        Permanent: true,
      });

      console.log('🔑 Definindo senha permanente...');
      await this.client.send(setPasswordCommand);
      console.log('✅ Senha definida como permanente');

      // 3. Marcar email como verificado
      const updateAttributesCommand = new AdminUpdateUserAttributesCommand({
        UserPoolId: this.config.userPoolId,
        Username: data.email,
        UserAttributes: [
          { Name: 'email_verified', Value: 'true' },
        ],
      });

      console.log('📧 Marcando email como verificado...');
      await this.client.send(updateAttributesCommand);
      console.log('✅ Email marcado como verificado');

      return new User(
        createUserResponse.User?.Username || data.email,
        data.email,
        data.name,
        createUserResponse.User?.UserCreateDate || new Date(),
        true,
      );
    } catch (error) {
      console.error('❌ Erro detalhado:', {
        name: error.name,
        message: error.message,
        code: error.Code,
        statusCode: error.$metadata?.httpStatusCode,
        requestId: error.$metadata?.requestId,
        stack: error.stack,
      });

      this.handleCognitoError(error);
      throw error;
    }
  }

  async authenticateUser(data: LoginData): Promise<AuthResult> {
    try {
      const authCommand = new AdminInitiateAuthCommand({
        UserPoolId: this.config.userPoolId,
        ClientId: this.config.clientId,
        AuthFlow: AuthFlowType.ADMIN_NO_SRP_AUTH,
        AuthParameters: {
          USERNAME: data.email,
          PASSWORD: data.password,
          ...(this.config.clientSecret && {
            SECRET_HASH: this.calculateSecretHash(data.email),
          }),
        },
      });

      const authResponse: AdminInitiateAuthResponse = await this.client.send(authCommand);

      if (!authResponse.AuthenticationResult) {
        throw new Error('Falha na autenticação');
      }

      const { AuthenticationResult } = authResponse;

      return new AuthResult(
        AuthenticationResult.AccessToken!,
        AuthenticationResult.RefreshToken!,
        AuthenticationResult.IdToken!,
        AuthenticationResult.ExpiresIn!,
        AuthenticationResult.TokenType || 'Bearer',
      );
    } catch (error) {
      this.handleCognitoError(error);
      throw error;
    }
  }

  private calculateSecretHash(username: string): string {
    if (!this.config.clientSecret) {
      throw new Error('Client secret não configurado');
    }

    const message = username + this.config.clientId;
    const hash = createHmac('sha256', this.config.clientSecret)
        .update(message)
        .digest('base64');

    return hash;
  }

  private handleCognitoError(error: any): void {
    const errorCode = error.name || error.__type || error.Code;
    const errorMessage = error.message || 'Erro desconhecido';

    console.error('🔍 Analisando erro do Cognito:', {
      errorCode,
      errorMessage,
      httpStatus: error.$metadata?.httpStatusCode,
    });

    switch (errorCode) {
      case 'UsernameExistsException':
        throw new Error('Usuário já existe');
      case 'InvalidPasswordException':
        throw new Error('Senha não atende aos critérios de segurança');
      case 'NotAuthorizedException':
        throw new Error('Credenciais inválidas');
      case 'UserNotFoundException':
        throw new Error('Usuário não encontrado');
      case 'TooManyRequestsException':
        throw new Error('Muitas tentativas. Tente novamente mais tarde');
      case 'InvalidParameterException':
        throw new Error(`Parâmetros inválidos: ${errorMessage}`);
      case 'ResourceNotFoundException':
        throw new Error('User Pool não encontrado. Verifique COGNITO_USER_POOL_ID');
      case 'UnauthorizedOperation':
      case 'AccessDeniedException':
        throw new Error('Sem permissão. Verifique as credenciais AWS e políticas IAM');
      case 'ValidationException':
        throw new Error(`Erro de validação: ${errorMessage}`);
      default:
        throw new Error(`Erro do Cognito [${errorCode}]: ${errorMessage}`);
    }
  }
}