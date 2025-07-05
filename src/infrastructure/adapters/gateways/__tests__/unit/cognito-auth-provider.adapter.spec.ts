import { Test, TestingModule } from '@nestjs/testing';
import { CognitoAuthProviderAdapter } from 'src/infrastructure/adapters/gateways/cognito-auth-provider.adapter';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { User } from 'src/domain/entities/user.entity';
import { AuthResult } from 'src/domain/entities/auth-result.entity';
import { AuthProviderPort } from 'src/domain/ports/gateways/auth-provider.port';

jest.mock('@aws-sdk/client-cognito-identity-provider');

describe('CognitoAuthProviderAdapter', () => {
  let adapter: CognitoAuthProviderAdapter;
  let mockCognitoClient: jest.Mocked<CognitoIdentityProviderClient>;
  let mockCognitoConfig: any;

  const mockUserData = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
  };

  const mockLoginData = {
    email: 'john@example.com',
    password: 'SecurePass123!',
  };

  const mockSub = 'user-sub-123';

  beforeEach(async () => {
    mockCognitoClient = {
      send: jest.fn(),
    } as any;

    mockCognitoConfig = {
      region: 'us-east-1',
      userPoolId: 'us-east-1_testpool',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    };

    (CognitoIdentityProviderClient as jest.Mock).mockImplementation(() => mockCognitoClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthProviderPort,
          useFactory: () => {
            return new CognitoAuthProviderAdapter(mockCognitoConfig);
          },
        },
      ],
    }).compile();

    adapter = module.get<AuthProviderPort>(AuthProviderPort) as CognitoAuthProviderAdapter;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Given CognitoAuthProviderAdapter', () => {
    describe('When creating a user', () => {
      describe('And user creation is successful', () => {
        beforeEach(() => {
          (mockCognitoClient.send as jest.Mock).mockResolvedValue({
            User: {
              Username: 'john@example.com',
              Attributes: [
                { Name: 'sub', Value: 'user-sub-123' },
                { Name: 'email', Value: 'john@example.com' },
                { Name: 'name', Value: 'John Doe' },
                { Name: 'email_verified', Value: 'true' },
              ],
              UserCreateDate: new Date(),
            },
          });
        });

        it('Then should create user successfully', async () => {
          const result = await adapter.createUser(mockUserData);

          expect(result).toBeInstanceOf(User);
          expect(result.email).toBe('john@example.com');
          expect(result.name).toBe('John Doe');
          expect(result.id).toBe('user-sub-123');
          expect(result.isEmailVerified).toBe(true);
          expect(mockCognitoClient.send).toHaveBeenCalled();
        });

        it('Then should handle user with unverified email', async () => {
          (mockCognitoClient.send as jest.Mock).mockResolvedValue({
            User: {
              Username: 'jane@example.com',
              Attributes: [
                { Name: 'sub', Value: 'user-sub-456' },
                { Name: 'email', Value: 'jane@example.com' },
                { Name: 'name', Value: 'Jane Smith' },
                { Name: 'email_verified', Value: 'false' },
              ],
              UserCreateDate: new Date(),
            },
          });

          const differentUserData = {
            name: 'Jane Smith',
            email: 'jane@example.com',
            password: 'AnotherPass456!',
          };

          const result = await adapter.createUser(differentUserData);

          expect(result.isEmailVerified).toBe(true);
        });
      });

      describe('And user creation fails', () => {
        describe('And error is UsernameExistsException', () => {
          beforeEach(() => {
            const error = new Error('UsernameExistsException');
            error.name = 'UsernameExistsException';
            (mockCognitoClient.send as jest.Mock).mockRejectedValue(error);
          });

          it('Then should throw user already exists error', async () => {
            await expect(adapter.createUser(mockUserData)).rejects.toThrow('Usuário já existe');
          });
        });

        describe('And error is InvalidPasswordException', () => {
          beforeEach(() => {
            const error = new Error('InvalidPasswordException');
            error.name = 'InvalidPasswordException';
            (mockCognitoClient.send as jest.Mock).mockRejectedValue(error);
          });

          it('Then should throw password validation error', async () => {
            await expect(adapter.createUser(mockUserData)).rejects.toThrow(
              'Senha não atende aos critérios de segurança',
            );
          });
        });

        describe('And error is InvalidParameterException', () => {
          beforeEach(() => {
            const error = new Error('InvalidParameterException');
            error.name = 'InvalidParameterException';
            (mockCognitoClient.send as jest.Mock).mockRejectedValue(error);
          });

          it('Then should throw invalid parameters error', async () => {
            await expect(adapter.createUser(mockUserData)).rejects.toThrow('Parâmetros inválidos');
          });
        });

        describe('And error is ResourceNotFoundException', () => {
          beforeEach(() => {
            const error = new Error('ResourceNotFoundException');
            error.name = 'ResourceNotFoundException';
            (mockCognitoClient.send as jest.Mock).mockRejectedValue(error);
          });

          it('Then should throw resource not found error', async () => {
            await expect(adapter.createUser(mockUserData)).rejects.toThrow('Recurso não encontrado');
          });
        });

        describe('And error is TooManyRequestsException', () => {
          beforeEach(() => {
            const error = new Error('TooManyRequestsException');
            error.name = 'TooManyRequestsException';
            (mockCognitoClient.send as jest.Mock).mockRejectedValue(error);
          });

          it('Then should throw too many requests error', async () => {
            await expect(adapter.createUser(mockUserData)).rejects.toThrow(
              'Muitas tentativas. Tente novamente mais tarde',
            );
          });
        });

        describe('And error is unknown', () => {
          beforeEach(() => {
            (mockCognitoClient.send as jest.Mock).mockRejectedValue(new Error('Erro desconhecido do Cognito'));
          });

          it('Then should throw generic Cognito error', async () => {
            await expect(adapter.createUser(mockUserData)).rejects.toThrow(
              'Erro do Cognito: Erro desconhecido do Cognito',
            );
          });
        });
      });
    });

    describe('When authenticating a user', () => {
      describe('And authentication is successful', () => {
        beforeEach(() => {
          (mockCognitoClient.send as jest.Mock).mockResolvedValue({
            AuthenticationResult: {
              AccessToken: 'access-token-123',
              RefreshToken: 'refresh-token-456',
              IdToken: 'id-token-789',
              ExpiresIn: 3600,
              TokenType: 'Bearer',
            },
          });
        });

        it('Then should authenticate user successfully', async () => {
          const result = await adapter.authenticateUser(mockLoginData);

          expect(result).toBeInstanceOf(AuthResult);
          expect(result.accessToken).toBe('access-token-123');
          expect(result.refreshToken).toBe('refresh-token-456');
          expect(result.expiresIn).toBe(3600);
          expect(result.tokenType).toBe('Bearer');
          expect(mockCognitoClient.send).toHaveBeenCalled();
        });
      });

      describe('And authentication fails', () => {
        describe('And error is NotAuthorizedException', () => {
          beforeEach(() => {
            const error = new Error('NotAuthorizedException');
            error.name = 'NotAuthorizedException';
            (mockCognitoClient.send as jest.Mock).mockRejectedValue(error);
          });

          it('Then should throw invalid credentials error', async () => {
            await expect(adapter.authenticateUser(mockLoginData)).rejects.toThrow(
              'Credenciais inválidas',
            );
          });
        });

        describe('And error is UserNotConfirmedException', () => {
          beforeEach(() => {
            const error = new Error('UserNotConfirmedException');
            error.name = 'UserNotConfirmedException';
            (mockCognitoClient.send as jest.Mock).mockRejectedValue(error);
          });

          it('Then should throw user not confirmed error', async () => {
            await expect(adapter.authenticateUser(mockLoginData)).rejects.toThrow(
              'Usuário não confirmado',
            );
          });
        });

        describe('And error is UserNotFoundException', () => {
          beforeEach(() => {
            const error = new Error('UserNotFoundException');
            error.name = 'UserNotFoundException';
            (mockCognitoClient.send as jest.Mock).mockRejectedValue(error);
          });

          it('Then should throw user not found error', async () => {
            await expect(adapter.authenticateUser(mockLoginData)).rejects.toThrow(
              'Usuário não encontrado',
            );
          });
        });

        describe('And error is TooManyRequestsException', () => {
          beforeEach(() => {
            const error = new Error('TooManyRequestsException');
            error.name = 'TooManyRequestsException';
            (mockCognitoClient.send as jest.Mock).mockRejectedValue(error);
          });

          it('Then should throw too many requests error', async () => {
            await expect(adapter.authenticateUser(mockLoginData)).rejects.toThrow(
              'Muitas tentativas. Tente novamente mais tarde',
            );
          });
        });

        describe('And error is unknown', () => {
          beforeEach(() => {
            (mockCognitoClient.send as jest.Mock).mockRejectedValue(new Error('Erro desconhecido do Cognito'));
          });

          it('Then should throw generic Cognito error', async () => {
            await expect(adapter.authenticateUser(mockLoginData)).rejects.toThrow(
              'Erro do Cognito: Erro desconhecido do Cognito',
            );
          });
        });
      });

      describe('And authentication fails due to missing AuthenticationResult', () => {
        beforeEach(() => {
          (mockCognitoClient.send as jest.Mock).mockResolvedValue({});
        });
        it('Then should throw authentication failure error', async () => {
          await expect(adapter.authenticateUser(mockLoginData)).rejects.toThrow('Falha na autenticação');
        });
      });
    });

    describe('When getting user by sub', () => {
      describe('And user is found', () => {
        beforeEach(() => {
          (mockCognitoClient.send as jest.Mock).mockResolvedValue({
            Users: [
              {
                Username: 'john@example.com',
                Attributes: [
                  { Name: 'sub', Value: 'user-sub-123' },
                  { Name: 'email', Value: 'john@example.com' },
                  { Name: 'name', Value: 'John Doe' },
                  { Name: 'email_verified', Value: 'true' },
                ],
                UserCreateDate: new Date(),
              },
            ],
          });
        });

        it('Then should return user successfully', async () => {
          const result = await adapter.getUserBySub(mockSub);

          expect(result).toBeInstanceOf(User);
          expect(result!.email).toBe('john@example.com');
          expect(result!.name).toBe('John Doe');
          expect(result!.id).toBe('user-sub-123');
          expect(mockCognitoClient.send).toHaveBeenCalled();
        });

        it('Then should handle user with different sub', async () => {
          const differentSub = 'user-sub-456';
          (mockCognitoClient.send as jest.Mock).mockResolvedValue({
            Users: [
              {
                Username: 'jane@example.com',
                Attributes: [
                  { Name: 'sub', Value: 'user-sub-456' },
                  { Name: 'email', Value: 'jane@example.com' },
                  { Name: 'name', Value: 'Jane Smith' },
                  { Name: 'email_verified', Value: 'false' },
                ],
                UserCreateDate: new Date(),
              },
            ],
          });

          const result = await adapter.getUserBySub(differentSub);

          expect(result!.email).toBe('jane@example.com');
          expect(result!.name).toBe('Jane Smith');
          expect(result!.id).toBe('user-sub-456');
        });
      });

      describe('And user is not found', () => {
        beforeEach(() => {
          (mockCognitoClient.send as jest.Mock).mockResolvedValue({
            Users: [],
          });
        });

        it('Then should return null', async () => {
          const result = await adapter.getUserBySub(mockSub);
          expect(result).toBeNull();
        });
      });

      describe('And API call fails', () => {
        describe('And error is ResourceNotFoundException', () => {
          beforeEach(() => {
            const error = new Error('ResourceNotFoundException');
            error.name = 'ResourceNotFoundException';
            (mockCognitoClient.send as jest.Mock).mockRejectedValue(error);
          });

          it('Then should throw resource not found error', async () => {
            await expect(adapter.getUserBySub(mockSub)).rejects.toThrow('Recurso não encontrado');
          });
        });

        describe('And error is TooManyRequestsException', () => {
          beforeEach(() => {
            const error = new Error('TooManyRequestsException');
            error.name = 'TooManyRequestsException';
            (mockCognitoClient.send as jest.Mock).mockRejectedValue(error);
          });

          it('Then should throw too many requests error', async () => {
            await expect(adapter.getUserBySub(mockSub)).rejects.toThrow(
              'Muitas tentativas. Tente novamente mais tarde',
            );
          });
        });

        describe('And error is unknown', () => {
          beforeEach(() => {
            (mockCognitoClient.send as jest.Mock).mockRejectedValue(new Error('Erro desconhecido do Cognito'));
          });

          it('Then should throw generic Cognito error', async () => {
            await expect(adapter.getUserBySub(mockSub)).rejects.toThrow(
              'Erro do Cognito: Erro desconhecido do Cognito',
            );
          });
        });
      });

      describe('And Cognito returns no users', () => {
        beforeEach(() => {
          (mockCognitoClient.send as jest.Mock).mockResolvedValue({ Users: [] });
        });
        it('Then should return null', async () => {
          const result = await adapter.getUserBySub(mockSub);
          expect(result).toBeNull();
        });
      });

      describe('And Cognito returns undefined Users', () => {
        beforeEach(() => {
          (mockCognitoClient.send as jest.Mock).mockResolvedValue({});
        });
        it('Then should return null', async () => {
          const result = await adapter.getUserBySub(mockSub);
          expect(result).toBeNull();
        });
      });

      describe('And Cognito throws UserNotFoundException', () => {
        beforeEach(() => {
          const error = new Error('UserNotFoundException');
          error.name = 'UserNotFoundException';
          (mockCognitoClient.send as jest.Mock).mockRejectedValue(error);
        });
        it('Then should return null', async () => {
          const result = await adapter.getUserBySub(mockSub);
          expect(result).toBeNull();
        });
      });
    });
  });

  describe('Cobertura extra de erros do CognitoAuthProviderAdapter', () => {
    let adapter: CognitoAuthProviderAdapter;
    let mockCognitoClient: any;
    let mockCognitoConfig: any;

    beforeEach(() => {
      mockCognitoClient = { send: jest.fn() };
      mockCognitoConfig = {
        region: 'us-east-1',
        userPoolId: 'us-east-1_testpool',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
      };
      adapter = new CognitoAuthProviderAdapter(mockCognitoConfig);
      // @ts-expect-error - Testing private property assignment
      adapter.client = mockCognitoClient;
    });

    it('deve lançar erro se falhar ao definir senha definitiva', async () => {
      mockCognitoClient.send
        .mockResolvedValueOnce({ User: { Username: 'john@example.com', Attributes: [{ Name: 'sub', Value: 'user-sub-123' }], UserCreateDate: new Date() } })
        .mockRejectedValueOnce(new Error('Falha ao definir senha'));
      await expect(adapter.createUser({ name: 'John', email: 'john@example.com', password: '12345678' })).rejects.toThrow('Falha ao definir senha');
    });

    it('deve lançar erro se falhar ao atualizar atributos', async () => {
      mockCognitoClient.send
        .mockResolvedValueOnce({ User: { Username: 'john@example.com', Attributes: [{ Name: 'sub', Value: 'user-sub-123' }], UserCreateDate: new Date() } })
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('Falha ao atualizar atributos'));
      await expect(adapter.createUser({ name: 'John', email: 'john@example.com', password: '12345678' })).rejects.toThrow('Falha ao atualizar atributos');
    });

    it('deve lançar erro se não houver AuthenticationResult', async () => {
      mockCognitoClient.send.mockResolvedValue({});
      await expect(adapter.authenticateUser({ email: 'john@example.com', password: '12345678' })).rejects.toThrow('Falha na autenticação');
    });

    it('deve lançar erro se getUserBySub der erro desconhecido', async () => {
      mockCognitoClient.send.mockRejectedValue(new Error('Erro desconhecido qualquer'));
      await expect(adapter.getUserBySub('sub')).rejects.toThrow('Erro do Cognito: Erro desconhecido qualquer');
    });

    it('deve lançar erro se calcular secret hash sem clientSecret', () => {
      const configSemSecret = { ...mockCognitoConfig, clientSecret: undefined };
      const adapterSemSecret = new CognitoAuthProviderAdapter(configSemSecret);
      expect(() => (adapterSemSecret as any).calculateSecretHash('user')).toThrow('Client secret não configurado');
    });
  });

  describe('When calculating secret hash', () => {
    it('Then should throw error if clientSecret is not configured', () => {
      adapter = new CognitoAuthProviderAdapter({ ...mockCognitoConfig, clientSecret: undefined });
      expect(() => (adapter as any).calculateSecretHash('user')).toThrow('Client secret não configurado');
    });
  });

  describe('When handling Cognito errors', () => {
    const errorCases = [
      { name: 'UsernameExistsException', message: 'Usuário já existe' },
      { name: 'InvalidPasswordException', message: 'Senha não atende aos critérios de segurança' },
      { name: 'NotAuthorizedException', message: 'Credenciais inválidas' },
      { name: 'UserNotConfirmedException', message: 'Usuário não confirmado' },
      { name: 'UserNotFoundException', message: 'Usuário não encontrado' },
      { name: 'TooManyRequestsException', message: 'Muitas tentativas. Tente novamente mais tarde' },
      { name: 'InvalidParameterException', message: 'Parâmetros inválidos' },
      { name: 'ResourceNotFoundException', message: 'Recurso não encontrado' },
      { name: 'QualquerOutra', message: 'Erro do Cognito: Mensagem desconhecida' },
    ];
    errorCases.forEach(({ name, message }) => {
      it(`Then should throw correct error for ${name}`, () => {
        const error: any = { name, message: name === 'QualquerOutra' ? 'Mensagem desconhecida' : undefined };
        if (name === 'QualquerOutra') error.name = 'QualquerOutra';
        if (name === 'QualquerOutra') error.message = 'Mensagem desconhecida';
        if (name !== 'QualquerOutra') error.message = undefined;
        try {
          (adapter as any).handleCognitoError(error);
        } catch (e: any) {
          if (name === 'QualquerOutra') {
            expect(e.message).toBe('Erro do Cognito: Mensagem desconhecida');
          } else {
            expect(e.message).toBe(message);
          }
        }
      });
    });
  });
}); 