import { Test, TestingModule } from '@nestjs/testing';
import { LoginUserUseCase } from 'src/application/usecases/login-user.usecase';
import { AuthProviderPort } from 'src/domain/ports/gateways/auth-provider.port';
import { AuthResult } from 'src/domain/entities/auth-result.entity';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let mockAuthProvider: jest.Mocked<AuthProviderPort>;

  const mockLoginData = {
    email: 'john@example.com',
    password: 'SecurePass123!',
  };

  const mockAuthResult = AuthResult.create({
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-456',
    idToken: 'id-token-789',
    expiresIn: 3600,
    tokenType: 'Bearer',
  });

  beforeEach(async () => {
    mockAuthProvider = {
      createUser: jest.fn(),
      authenticateUser: jest.fn(),
      getUserBySub: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserUseCase,
        {
          provide: AuthProviderPort,
          useValue: mockAuthProvider,
        },
      ],
    }).compile();

    useCase = module.get<LoginUserUseCase>(LoginUserUseCase);
  });

  describe('Given LoginUserUseCase', () => {
    describe('When user login is successful', () => {
      beforeEach(() => {
        mockAuthProvider.authenticateUser.mockResolvedValue(mockAuthResult);
      });

      it('Then should authenticate user with valid credentials', async () => {
        const result = await useCase.execute(mockLoginData);

        expect(result).toEqual(mockAuthResult);
        expect(mockAuthProvider.authenticateUser).toHaveBeenCalledWith(mockLoginData);
      });

      it('Then should handle different user credentials', async () => {
        const differentLoginData = {
          email: 'jane@example.com',
          password: 'AnotherPass456!',
        };

        const differentAuthResult = AuthResult.create({
          accessToken: 'access-token-789',
          refreshToken: 'refresh-token-012',
          idToken: 'id-token-999',
          expiresIn: 7200,
          tokenType: 'Bearer',
        });

        mockAuthProvider.authenticateUser.mockResolvedValue(differentAuthResult);

        const result = await useCase.execute(differentLoginData);

        expect(result).toEqual(differentAuthResult);
        expect(mockAuthProvider.authenticateUser).toHaveBeenCalledWith(differentLoginData);
      });
    });

    describe('When user login fails', () => {
      describe('And error is NotAuthorizedException', () => {
        beforeEach(() => {
          mockAuthProvider.authenticateUser.mockRejectedValue(
            new Error('Credenciais inválidas'),
          );
        });

        it('Then should throw invalid credentials error', async () => {
          await expect(useCase.execute(mockLoginData)).rejects.toThrow('Credenciais inválidas');
        });
      });

      describe('And error is UserNotConfirmedException', () => {
        beforeEach(() => {
          mockAuthProvider.authenticateUser.mockRejectedValue(
            new Error('Usuário não confirmado'),
          );
        });

        it('Then should throw user not confirmed error', async () => {
          await expect(useCase.execute(mockLoginData)).rejects.toThrow('Usuário não confirmado');
        });
      });

      describe('And error is UserNotFoundException', () => {
        beforeEach(() => {
          mockAuthProvider.authenticateUser.mockRejectedValue(
            new Error('Usuário não encontrado'),
          );
        });

        it('Then should throw user not found error', async () => {
          await expect(useCase.execute(mockLoginData)).rejects.toThrow('Usuário não encontrado');
        });
      });

      describe('And error is TooManyRequestsException', () => {
        beforeEach(() => {
          mockAuthProvider.authenticateUser.mockRejectedValue(
            new Error('Muitas tentativas. Tente novamente mais tarde'),
          );
        });

        it('Then should throw too many requests error', async () => {
          await expect(useCase.execute(mockLoginData)).rejects.toThrow(
            'Muitas tentativas. Tente novamente mais tarde',
          );
        });
      });

      describe('And error is unknown', () => {
        beforeEach(() => {
          mockAuthProvider.authenticateUser.mockRejectedValue(
            new Error('Erro desconhecido do Cognito'),
          );
        });

        it('Then should throw generic Cognito error', async () => {
          await expect(useCase.execute(mockLoginData)).rejects.toThrow(
            'Erro do Cognito: Erro desconhecido do Cognito',
          );
        });
      });
    });

    describe('When input validation fails', () => {
      describe('And email is missing', () => {
        it('Then should throw validation error', async () => {
          const invalidData = { ...mockLoginData, email: '' };

          await expect(useCase.execute(invalidData)).rejects.toThrow('E-mail é obrigatório');
        });
      });

      describe('And email is invalid', () => {
        it('Then should throw validation error', async () => {
          const invalidData = { ...mockLoginData, email: 'invalid-email' };

          await expect(useCase.execute(invalidData)).rejects.toThrow('E-mail inválido');
        });
      });

      describe('And password is missing', () => {
        it('Then should throw validation error', async () => {
          const invalidData = { ...mockLoginData, password: '' };

          await expect(useCase.execute(invalidData)).rejects.toThrow('Senha é obrigatória');
        });
      });

      describe('And password is too short', () => {
        it('Then should throw validation error', async () => {
          const invalidData = { ...mockLoginData, password: '123' };

          await expect(useCase.execute(invalidData)).rejects.toThrow(
            'Senha deve ter pelo menos 8 caracteres',
          );
        });
      });
    });
  });
}); 