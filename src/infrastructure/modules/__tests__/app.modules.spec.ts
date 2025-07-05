import { Test } from '@nestjs/testing';
import { AppModule } from '../app.modules';
import { AuthController } from '../../adapters/controllers/auth.controller';
import { UserController } from '../../adapters/controllers/user.controller';
import { CreateUserUseCase } from '../../../application/usecases/create-user.usecase';
import { GetUserEmailUseCase } from '../../../application/usecases/get-user-email.usecase';
import { LoginUserUseCase } from '../../../application/usecases/login-user.usecase';
import { AuthProviderPort } from '../../../domain/ports/gateways/auth-provider.port';

describe('AppModule', () => {
  it('should compile the module and register controllers and providers', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleRef.get(AuthController)).toBeInstanceOf(AuthController);
    expect(moduleRef.get(UserController)).toBeInstanceOf(UserController);
    expect(moduleRef.get(CreateUserUseCase)).toBeInstanceOf(CreateUserUseCase);
    expect(moduleRef.get(GetUserEmailUseCase)).toBeInstanceOf(GetUserEmailUseCase);
    expect(moduleRef.get(LoginUserUseCase)).toBeInstanceOf(LoginUserUseCase);
    expect(moduleRef.get(AuthProviderPort)).toBeDefined();
  });
}); 