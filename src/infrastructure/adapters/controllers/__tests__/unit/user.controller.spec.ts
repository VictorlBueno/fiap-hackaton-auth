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
    it('should return user email successfully', async () => {
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

    it('should throw HttpException with status 400 when sub is required', async () => {
      const userSub = 'user-sub-123';
      const errorMessage = 'Sub is required';

      getUserEmailUseCase.execute.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getUserEmail(userSub)).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.BAD_REQUEST)
      );

      expect(getUserEmailUseCase.execute).toHaveBeenCalledWith(userSub);
    });

    it('should throw HttpException with status 404 when user not found', async () => {
      const userSub = 'user-sub-123';
      const errorMessage = 'User not found';

      getUserEmailUseCase.execute.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getUserEmail(userSub)).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.NOT_FOUND)
      );

      expect(getUserEmailUseCase.execute).toHaveBeenCalledWith(userSub);
    });

    it('should throw HttpException with status 429 when too many requests', async () => {
      const userSub = 'user-sub-123';
      const errorMessage = 'Too many requests';

      getUserEmailUseCase.execute.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getUserEmail(userSub)).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.TOO_MANY_REQUESTS)
      );

      expect(getUserEmailUseCase.execute).toHaveBeenCalledWith(userSub);
    });

    it('should throw HttpException with status 500 for internal error', async () => {
      const userSub = 'user-sub-123';
      const errorMessage = 'Internal server error';

      getUserEmailUseCase.execute.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getUserEmail(userSub)).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR)
      );

      expect(getUserEmailUseCase.execute).toHaveBeenCalledWith(userSub);
    });

    it('should throw HttpException with status 500 when error has no message', async () => {
      const userSub = 'user-sub-123';

      getUserEmailUseCase.execute.mockRejectedValue(new Error());

      await expect(controller.getUserEmail(userSub)).rejects.toThrow(
        new HttpException('Erro interno do servidor', HttpStatus.INTERNAL_SERVER_ERROR)
      );

      expect(getUserEmailUseCase.execute).toHaveBeenCalledWith(userSub);
    });

    it('should throw HttpException with status 500 for generic error', async () => {
      const userSub = 'user-sub-123';
      const errorMessage = 'Generic error message';

      getUserEmailUseCase.execute.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getUserEmail(userSub)).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR)
      );

      expect(getUserEmailUseCase.execute).toHaveBeenCalledWith(userSub);
    });
  });
}); 