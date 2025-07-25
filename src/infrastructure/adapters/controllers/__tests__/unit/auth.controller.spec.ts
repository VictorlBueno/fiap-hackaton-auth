import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/infrastructure/adapters/controllers/auth.controller';
import { CreateUserUseCase } from 'src/application/usecases/create-user.usecase';
import { LoginUserUseCase } from 'src/application/usecases/login-user.usecase';
import { CreateUserDto } from 'src/infrastructure/adapters/controllers/dtos/create-user.dto';
import { LoginDto } from 'src/infrastructure/adapters/controllers/dtos/login.dto';
import { User } from 'src/domain/entities/user.entity';
import { AuthResult } from 'src/domain/entities/auth-result.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let mockCreateUserUseCase: jest.Mocked<CreateUserUseCase>;
  let mockLoginUserUseCase: jest.Mocked<LoginUserUseCase>;

  const mockCreateUserDto: CreateUserDto = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
  };

  const mockLoginDto: LoginDto = {
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

  const mockAuthResult = AuthResult.create({
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-456',
    idToken: 'id-token-789',
    expiresIn: 3600,
    tokenType: 'Bearer',
  });

  beforeEach(async () => {
    mockCreateUserUseCase = {
      execute: jest.fn(),
    } as any;

    mockLoginUserUseCase = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: CreateUserUseCase,
          useValue: mockCreateUserUseCase,
        },
        {
          provide: LoginUserUseCase,
          useValue: mockLoginUserUseCase,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('Given AuthController', () => {
    describe('When creating a user', () => {
      describe('And user creation is successful', () => {
        beforeEach(() => {
          mockCreateUserUseCase.execute.mockResolvedValue(mockUser);
        });

        it('Then should create user and return user data', async () => {
          const result = await controller.createUser(mockCreateUserDto);

          expect(result).toEqual(mockUser);
          expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(mockCreateUserDto);
        });

        it('Then should handle different user data', async () => {
          const differentUserDto: CreateUserDto = {
            name: 'Jane Smith',
            email: 'jane@example.com',
            password: 'AnotherPass456!',
          };

          const differentUser = User.create({
            id: 'user-456',
            email: 'jane@example.com',
            name: 'Jane Smith',
            createdAt: new Date(),
            isEmailVerified: false,
          });

          mockCreateUserUseCase.execute.mockResolvedValue(differentUser);

          const result = await controller.createUser(differentUserDto);

          expect(result).toEqual(differentUser);
          expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(differentUserDto);
        });
      });

      describe('And user creation fails', () => {
        it('Then should throw conflict error for user already exists', async () => {
          mockCreateUserUseCase.execute.mockRejectedValue(new Error('Usuário já existe'));
          await expect(controller.createUser(mockCreateUserDto)).rejects.toThrow(
            'Usuário já existe',
          );
        });

        it('Then should throw bad request error for invalid data', async () => {
          mockCreateUserUseCase.execute.mockRejectedValue(new Error('Senha não atende aos critérios'));
          await expect(controller.createUser(mockCreateUserDto)).rejects.toThrow(
            'Senha não atende aos critérios',
          );
        });

        it('Then should throw bad request error for missing required field', async () => {
          mockCreateUserUseCase.execute.mockRejectedValue(new Error('Email é obrigatório'));
          await expect(controller.createUser(mockCreateUserDto)).rejects.toThrow(
            'Email é obrigatório',
          );
        });

        it('Then should throw internal server error for unknown error', async () => {
          mockCreateUserUseCase.execute.mockRejectedValue(new Error('Erro desconhecido'));
          await expect(controller.createUser(mockCreateUserDto)).rejects.toThrow(
            'Erro desconhecido',
          );
        });

        it('Then should throw internal server error when error has no message', async () => {
          mockCreateUserUseCase.execute.mockRejectedValue(new Error());
          await expect(controller.createUser(mockCreateUserDto)).rejects.toThrow(
            'Erro interno do servidor',
          );
        });
      });
    });

    describe('When user login', () => {
      describe('And login is successful', () => {
        beforeEach(() => {
          mockLoginUserUseCase.execute.mockResolvedValue(mockAuthResult);
        });

        it('Then should authenticate user and return auth result', async () => {
          const result = await controller.login(mockLoginDto);

          expect(result).toEqual(mockAuthResult);
          expect(mockLoginUserUseCase.execute).toHaveBeenCalledWith(mockLoginDto);
        });

        it('Then should handle different auth result', async () => {
          const differentAuthResult = AuthResult.create({
            accessToken: 'access-token-789',
            refreshToken: 'refresh-token-012',
            idToken: 'id-token-999',
            expiresIn: 7200,
            tokenType: 'Bearer',
          });

          mockLoginUserUseCase.execute.mockResolvedValue(differentAuthResult);

          const result = await controller.login(mockLoginDto);

          expect(result).toEqual(differentAuthResult);
          expect(mockLoginUserUseCase.execute).toHaveBeenCalledWith(mockLoginDto);
        });
      });

      describe('And login fails', () => {
        it('Then should throw unauthorized error for invalid credentials', async () => {
          mockLoginUserUseCase.execute.mockRejectedValue(new Error('Credenciais inválidas'));
          await expect(controller.login(mockLoginDto)).rejects.toThrow('Credenciais inválidas');
        });

        it('Then should throw unauthorized error for user not found', async () => {
          mockLoginUserUseCase.execute.mockRejectedValue(new Error('Usuário não encontrado'));
          await expect(controller.login(mockLoginDto)).rejects.toThrow('Usuário não encontrado');
        });

        it('Then should throw too many requests error', async () => {
          mockLoginUserUseCase.execute.mockRejectedValue(new Error('Muitas tentativas'));
          await expect(controller.login(mockLoginDto)).rejects.toThrow('Muitas tentativas');
        });

        it('Then should throw bad request error for invalid email', async () => {
          mockLoginUserUseCase.execute.mockRejectedValue(new Error('Email inválido'));
          await expect(controller.login(mockLoginDto)).rejects.toThrow('Email inválido');
        });

        it('Then should throw internal server error for unknown error', async () => {
          mockLoginUserUseCase.execute.mockRejectedValue(new Error('Erro desconhecido'));
          await expect(controller.login(mockLoginDto)).rejects.toThrow('Erro desconhecido');
        });
      });
    });
  });
}); 