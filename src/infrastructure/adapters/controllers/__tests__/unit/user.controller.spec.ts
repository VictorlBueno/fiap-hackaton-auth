import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserController } from 'src/infrastructure/adapters/controllers/user.controller';
import { GetUserEmailUseCase } from 'src/application/usecases/get-user-email.usecase';

describe('UserController', () => {
  let controller: UserController;
  let getUserEmailUseCase: jest.Mocked<GetUserEmailUseCase>;

  beforeEach(async () => {
    const mockGetUserEmailUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: GetUserEmailUseCase,
          useValue: mockGetUserEmailUseCase,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    getUserEmailUseCase = module.get(GetUserEmailUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserEmail', () => {
    it('deve retornar o email do usuário com sucesso', async () => {
      const userSub = 'user-sub-123';
      const expectedEmail = 'john@example.com';

      getUserEmailUseCase.execute.mockResolvedValue(expectedEmail);

      const result = await controller.getUserEmail(userSub);

      expect(getUserEmailUseCase.execute).toHaveBeenCalledWith(userSub);
      expect(result).toEqual({
        success: true,
        email: expectedEmail,
      });
    });

    it('deve lançar HttpException com status 400 quando sub é obrigatório', async () => {
      const userSub = 'user-sub-123';
      const errorMessage = 'Sub é obrigatório';

      getUserEmailUseCase.execute.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getUserEmail(userSub)).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.BAD_REQUEST)
      );

      expect(getUserEmailUseCase.execute).toHaveBeenCalledWith(userSub);
    });

    it('deve lançar HttpException com status 404 quando usuário não encontrado', async () => {
      const userSub = 'user-sub-123';
      const errorMessage = 'Usuário não encontrado';

      getUserEmailUseCase.execute.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getUserEmail(userSub)).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.NOT_FOUND)
      );

      expect(getUserEmailUseCase.execute).toHaveBeenCalledWith(userSub);
    });

    it('deve lançar HttpException com status 429 quando muitas tentativas', async () => {
      const userSub = 'user-sub-123';
      const errorMessage = 'Muitas tentativas';

      getUserEmailUseCase.execute.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getUserEmail(userSub)).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.TOO_MANY_REQUESTS)
      );

      expect(getUserEmailUseCase.execute).toHaveBeenCalledWith(userSub);
    });

    it('deve lançar HttpException com status 500 para erro interno', async () => {
      const userSub = 'user-sub-123';
      const errorMessage = 'Erro interno do servidor';

      getUserEmailUseCase.execute.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getUserEmail(userSub)).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR)
      );

      expect(getUserEmailUseCase.execute).toHaveBeenCalledWith(userSub);
    });

    it('deve lançar HttpException com status 500 quando erro não tem message', async () => {
      const userSub = 'user-sub-123';

      getUserEmailUseCase.execute.mockRejectedValue(new Error());

      await expect(controller.getUserEmail(userSub)).rejects.toThrow(
        new HttpException('Erro interno do servidor', HttpStatus.INTERNAL_SERVER_ERROR)
      );

      expect(getUserEmailUseCase.execute).toHaveBeenCalledWith(userSub);
    });
  });
}); 