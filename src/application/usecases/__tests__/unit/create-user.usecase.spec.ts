import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from 'src/application/usecases/create-user.usecase';
import { AuthProviderPort } from 'src/domain/ports/gateways/auth-provider.port';
import { User } from 'src/domain/entities/user.entity';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockAuthProvider: jest.Mocked<AuthProviderPort>;

  const mockUserData = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
  };

  const mockUser = User.create({
    id: 'user-123',
    email: 'john@example.com',
    name: 'John Doe',
    createdAt: new Date(),
    isEmailVerified: true,
  });

  beforeEach(async () => {
    mockAuthProvider = {
      createUser: jest.fn(),
      authenticateUser: jest.fn(),
      getUserBySub: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: AuthProviderPort,
          useValue: mockAuthProvider,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
  });

  describe('Given CreateUserUseCase', () => {
    describe('When creating a user successfully', () => {
      beforeEach(() => {
        mockAuthProvider.createUser.mockResolvedValue(mockUser);
      });

      it('Then should create user with valid data', async () => {
        const result = await useCase.execute(mockUserData);

        expect(result).toEqual(mockUser);
        expect(mockAuthProvider.createUser).toHaveBeenCalledWith(mockUserData);
      });

      it('Then should handle user with different data', async () => {
        const differentUserData = {
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: 'AnotherPass456!',
        };

        const differentUser = User.create({
          id: 'user-456',
          email: 'jane@example.com',
          name: 'Jane Smith',
          createdAt: new Date(),
          isEmailVerified: true,
        });

        mockAuthProvider.createUser.mockResolvedValue(differentUser);

        const result = await useCase.execute(differentUserData);

        expect(result).toEqual(differentUser);
        expect(mockAuthProvider.createUser).toHaveBeenCalledWith(differentUserData);
      });
    });

    describe('When user creation fails', () => {
      describe('And error is UsernameExistsException', () => {
        beforeEach(() => {
          mockAuthProvider.createUser.mockRejectedValue(new Error('Usuário já existe'));
        });

        it('Then should throw user already exists error', async () => {
          await expect(useCase.execute(mockUserData)).rejects.toThrow('Usuário já existe');
        });
      });

      describe('And error is InvalidPasswordException', () => {
        beforeEach(() => {
          mockAuthProvider.createUser.mockRejectedValue(
            new Error('Senha não atende aos critérios de segurança'),
          );
        });

        it('Then should throw password validation error', async () => {
          await expect(useCase.execute(mockUserData)).rejects.toThrow(
            'Senha não atende aos critérios de segurança',
          );
        });
      });

      describe('And error is InvalidParameterException', () => {
        beforeEach(() => {
          mockAuthProvider.createUser.mockRejectedValue(new Error('Parâmetros inválidos'));
        });

        it('Then should throw invalid parameters error', async () => {
          await expect(useCase.execute(mockUserData)).rejects.toThrow('Parâmetros inválidos');
        });
      });

      describe('And error is ResourceNotFoundException', () => {
        beforeEach(() => {
          mockAuthProvider.createUser.mockRejectedValue(new Error('Recurso não encontrado'));
        });

        it('Then should throw resource not found error', async () => {
          await expect(useCase.execute(mockUserData)).rejects.toThrow('Recurso não encontrado');
        });
      });

      describe('And error is TooManyRequestsException', () => {
        beforeEach(() => {
          mockAuthProvider.createUser.mockRejectedValue(
            new Error('Muitas tentativas. Tente novamente mais tarde'),
          );
        });

        it('Then should throw too many requests error', async () => {
          await expect(useCase.execute(mockUserData)).rejects.toThrow(
            'Muitas tentativas. Tente novamente mais tarde',
          );
        });
      });

      describe('And error is unknown', () => {
        beforeEach(() => {
          mockAuthProvider.createUser.mockRejectedValue(new Error('Erro desconhecido do Cognito'));
        });

        it('Then should throw generic Cognito error', async () => {
          await expect(useCase.execute(mockUserData)).rejects.toThrow(
            'Erro do Cognito: Erro desconhecido do Cognito',
          );
        });
      });
    });

    describe('When input validation fails', () => {
      describe('And name is missing', () => {
        it('Then should throw validation error', async () => {
          const invalidData = { ...mockUserData, name: '' };

          await expect(useCase.execute(invalidData)).rejects.toThrow('Nome é obrigatório');
        });
      });

      describe('And email is missing', () => {
        it('Then should throw validation error', async () => {
          const invalidData = { ...mockUserData, email: '' };

          await expect(useCase.execute(invalidData)).rejects.toThrow('E-mail é obrigatório');
        });
      });

      describe('And email is invalid', () => {
        it('Then should throw validation error', async () => {
          const invalidData = { ...mockUserData, email: 'invalid-email' };

          await expect(useCase.execute(invalidData)).rejects.toThrow('E-mail inválido');
        });
      });

      describe('And password is missing', () => {
        it('Then should throw validation error', async () => {
          const invalidData = { ...mockUserData, password: '' };

          await expect(useCase.execute(invalidData)).rejects.toThrow('Senha é obrigatória');
        });
      });

      describe('And password is too short', () => {
        it('Then should throw validation error', async () => {
          const invalidData = { ...mockUserData, password: '123' };

          await expect(useCase.execute(invalidData)).rejects.toThrow(
            'Senha deve ter pelo menos 8 caracteres',
          );
        });
      });

      describe('And password is too long', () => {
        it('Then should throw validation error', async () => {
          const invalidData = { ...mockUserData, password: 'a'.repeat(129) };

          await expect(useCase.execute(invalidData)).rejects.toThrow(
            'Senha deve ter no máximo 128 caracteres',
          );
        });
      });
    });
  });
}); 