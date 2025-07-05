import { AuthControllerPort } from '../auth.port';
import { AuthController } from '../../../../infrastructure/adapters/controllers/auth.controller';

describe('AuthControllerPort', () => {
  it('AuthController deve implementar AuthControllerPort', () => {
    // Verifica se todos os métodos da interface existem no controller
    const controller: AuthControllerPort = new AuthController({} as any, {} as any);
    expect(controller).toBeDefined();
    expect(typeof controller.createUser).toBe('function');
    expect(typeof controller.login).toBe('function');
  });

  it('um mock pode implementar AuthControllerPort', () => {
    const fake: AuthControllerPort = {
      createUser: jest.fn(),
      login: jest.fn(),
    };
    expect(typeof fake.createUser).toBe('function');
    expect(typeof fake.login).toBe('function');
  });
}); 