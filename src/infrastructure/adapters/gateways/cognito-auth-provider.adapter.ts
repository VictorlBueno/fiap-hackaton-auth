import { Injectable } from '@nestjs/common';
import {
  AdminCreateUserCommand,
  AdminCreateUserResponse,
  AdminGetUserCommand,
  AdminGetUserResponse,
  AdminInitiateAuthCommand,
  AdminInitiateAuthResponse,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  AuthFlowType,
  CognitoIdentityProviderClient,
  MessageActionType,
  ListUsersCommand,
  ListUsersResponse,
} from '@aws-sdk/client-cognito-identity-provider';
import { createHmac } from 'crypto';

import {
  AuthProviderPort,
  CreateUserData,
  LoginData,
} from '../../../domain/ports/gateways/auth-provider.port';
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

      const createUserResponse: AdminCreateUserResponse =
        await this.client.send(createUserCommand);

      // 2. Definir senha definitiva
      const setPasswordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: this.config.userPoolId,
        Username: data.email,
        Password: data.password,
        Permanent: true,
      });

      await this.client.send(setPasswordCommand);

      // 3. Marcar email como verificado
      const updateAttributesCommand = new AdminUpdateUserAttributesCommand({
        UserPoolId: this.config.userPoolId,
        Username: data.email,
        UserAttributes: [{ Name: 'email_verified', Value: 'true' }],
      });

      await this.client.send(updateAttributesCommand);

      return User.create({
        id: createUserResponse.User?.Attributes?.find(attr => attr.Name === 'sub')?.Value || createUserResponse.User?.Username || data.email,
        email: data.email,
        name: data.name,
        createdAt: createUserResponse.User?.UserCreateDate || new Date(),
        isEmailVerified: true,
      });
    } catch (error) {
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

      const authResponse: AdminInitiateAuthResponse =
        await this.client.send(authCommand);

      if (!authResponse.AuthenticationResult) {
        throw new Error('Falha na autenticação');
      }

      const { AuthenticationResult } = authResponse;

      return AuthResult.create({
        accessToken: AuthenticationResult.AccessToken!,
        refreshToken: AuthenticationResult.RefreshToken!,
        idToken: AuthenticationResult.IdToken!,
        expiresIn: AuthenticationResult.ExpiresIn!,
        tokenType: AuthenticationResult.TokenType || 'Bearer',
      });
    } catch (error) {
      this.handleCognitoError(error);
      throw error;
    }
  }

  async getUserBySub(userSub: string): Promise<User | null> {
    try {
      console.log(`[DEBUG] Buscando usuário no Cognito por sub - UserSub: ${userSub}, UserPoolId: ${this.config.userPoolId}`);
      
      // Busca pelo atributo sub
      const listUsersCommand = new ListUsersCommand({
        UserPoolId: this.config.userPoolId,
        Filter: `sub = \"${userSub}\"`,
        Limit: 1
      });
      const response = await this.client.send(listUsersCommand) as ListUsersResponse;
      console.log(`[DEBUG] Resposta do Cognito (ListUsers):`, JSON.stringify(response, null, 2));
      
      if (!response.Users || response.Users.length === 0) {
        console.log(`[DEBUG] Usuário não encontrado na resposta`);
        return null;
      }
      const userData = response.Users[0];
      const email = userData.Attributes?.find((attr: any) => attr.Name === 'email')?.Value;
      const name = userData.Attributes?.find((attr: any) => attr.Name === 'name')?.Value;
      const emailVerified = userData.Attributes?.find((attr: any) => attr.Name === 'email_verified')?.Value === 'true';
      const sub = userData.Attributes?.find((attr: any) => attr.Name === 'sub')?.Value;
      console.log(`[DEBUG] Atributos extraídos - Email: ${email}, Name: ${name}, EmailVerified: ${emailVerified}, Sub: ${sub}`);
      return User.create({
        id: sub || userSub,
        email: email || '',
        name: name || '',
        createdAt: userData.UserCreateDate || new Date(),
        isEmailVerified: emailVerified,
      });
    } catch (error: any) {
      console.log(`[DEBUG] Erro ao buscar usuário:`, error.name, error.message);
      if (error.name === 'UserNotFoundException') {
        return null;
      }
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
    const errorCode = error.name || error.__type;

    switch (errorCode) {
      case 'UsernameExistsException':
        throw new Error('Usuário já existe');
      case 'InvalidPasswordException':
        throw new Error('Senha não atende aos critérios de segurança');
      case 'NotAuthorizedException':
        throw new Error('Credenciais inválidas');
      case 'UserNotConfirmedException':
        throw new Error('Usuário não confirmado');
      case 'UserNotFoundException':
        throw new Error('Usuário não encontrado');
      case 'TooManyRequestsException':
        throw new Error('Muitas tentativas. Tente novamente mais tarde');
      case 'InvalidParameterException':
        throw new Error('Parâmetros inválidos');
      case 'ResourceNotFoundException':
        throw new Error('Recurso não encontrado');
      default:
        throw new Error(
          `Erro do Cognito: ${error.message || 'Erro desconhecido'}`,
        );
    }
  }
}
