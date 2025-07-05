import { Test, TestingModule } from '@nestjs/testing';
import { GetUserEmailUseCase } from 'src/application/usecases/get-user-email.usecase';
import { AuthProviderPort } from 'src/domain/ports/gateways/auth-provider.port';
import { User } from 'src/domain/entities/user.entity';

describe('GetUserEmailUseCase', () => {
  let useCase: GetUserEmailUseCase;
  let mockAuthProvider: jest.Mocked<AuthProviderPort>;

  const mockSub = 'user-sub-123';
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
        GetUserEmailUseCase,
        {
          provide: AuthProviderPort,
          useValue: mockAuthProvider,
        },
      ],
    }).compile();

    useCase = module.get<GetUserEmailUseCase>(GetUserEmailUseCase);
  });

  describe('Given GetUserEmailUseCase', () => {
    describe('When getting user email successfully', () => {
      beforeEach(() => {
        mockAuthProvider.getUserBySub.mockResolvedValue(mockUser);
      });

      it('Then should return user email for valid sub', async () => {
        const result = await useCase.execute(mockSub);

        expect(result).toBe('john@example.com');
        expect(mockAuthProvider.getUserBySub).toHaveBeenCalledWith(mockSub);
      });

      it('Then should handle different user sub', async () => {
        const differentSub = 'user-sub-456';
        const differentUser = User.create({
          id: 'user-456',
          email: 'jane@example.com',
          name: 'Jane Smith',
          createdAt: new Date(),
          isEmailVerified: true,
        });

        mockAuthProvider.getUserBySub.mockResolvedValue(differentUser);

        const result = await useCase.execute(differentSub);

        expect(result).toBe('jane@example.com');
        expect(mockAuthProvider.getUserBySub).toHaveBeenCalledWith(differentSub);
      });
    });

    describe('When getting user email fails', () => {
      describe('And user is not found (getUserBySub retorna null)', () => {
        beforeEach(() => {
          mockAuthProvider.getUserBySub.mockResolvedValue(null);
        });

        it('Then should throw user not found error', async () => {
          await expect(useCase.execute(mockSub)).rejects.toThrow('Usuário não encontrado');
        });
      });

      describe('And error is ResourceNotFoundException', () => {
        beforeEach(() => {
          const error = new Error('ResourceNotFoundException');
          error.name = 'ResourceNotFoundException';
          mockAuthProvider.getUserBySub.mockRejectedValue(error);
        });

        it('Then should throw user not found error', async () => {
          await expect(useCase.execute(mockSub)).rejects.toThrow('Usuário não encontrado');
        });
      });

      describe('And error is TooManyRequestsException', () => {
        beforeEach(() => {
          const error = new Error('TooManyRequestsException');
          error.name = 'TooManyRequestsException';
          mockAuthProvider.getUserBySub.mockRejectedValue(error);
        });

        it('Then should throw too many requests error', async () => {
          await expect(useCase.execute(mockSub)).rejects.toThrow(
            'Muitas tentativas. Tente novamente mais tarde',
          );
        });
      });

      describe('And error is unknown', () => {
        beforeEach(() => {
          const error = new Error('Erro desconhecido do Cognito');
          error.name = 'UnknownError';
          mockAuthProvider.getUserBySub.mockRejectedValue(error);
        });

        it('Then should throw generic Cognito error', async () => {
          await expect(useCase.execute(mockSub)).rejects.toThrow(
            'Erro do Cognito: Erro desconhecido do Cognito',
          );
        });
      });
    });

    describe('When input validation fails', () => {
      describe('And sub is missing', () => {
        it('Then should throw validation error', async () => {
          await expect(useCase.execute('')).rejects.toThrow('Sub é obrigatório');
        });
      });

      describe('And sub is null', () => {
        it('Then should throw validation error', async () => {
          await expect(useCase.execute(null as any)).rejects.toThrow('Sub é obrigatório');
        });
      });

      describe('And sub is undefined', () => {
        it('Then should throw validation error', async () => {
          await expect(useCase.execute(undefined as any)).rejects.toThrow('Sub é obrigatório');
        });
      });
    });
  });
}); 