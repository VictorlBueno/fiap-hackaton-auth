import { AuthControllerPort } from '../auth.port';
import { AuthController } from '../../../../infrastructure/adapters/controllers/auth.controller';

describe('AuthControllerPort', () => {
  it('AuthController should implement AuthControllerPort', () => {
    // Verifies if all interface methods exist in the controller
    const controller: AuthControllerPort = new AuthController({} as any, {} as any);
    expect(controller).toBeDefined();
    expect(typeof controller.createUser).toBe('function');
    expect(typeof controller.login).toBe('function');
  });

  it('a mock can implement AuthControllerPort', () => {
    const fake: AuthControllerPort = {
      createUser: jest.fn(),
      login: jest.fn(),
    };
    expect(typeof fake.createUser).toBe('function');
    expect(typeof fake.login).toBe('function');
  });
}); 