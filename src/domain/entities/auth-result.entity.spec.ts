import { AuthResult } from './auth-result.entity';

describe('AuthResult Entity', () => {
  describe('Given o método create', () => {
    describe('When tokenType é fornecido', () => {
      it('Then deve criar um AuthResult com o tokenType informado', () => {
        const result = AuthResult.create({
          accessToken: 'tokenA',
          refreshToken: 'tokenR',
          idToken: 'tokenI',
          expiresIn: 123,
          tokenType: 'CustomType',
        });
        expect(result.tokenType).toBe('CustomType');
      });
    });

    describe('When tokenType não é fornecido', () => {
      it('Then deve criar um AuthResult com tokenType padrão "Bearer"', () => {
        const result = AuthResult.create({
          accessToken: 'tokenA',
          refreshToken: 'tokenR',
          idToken: 'tokenI',
          expiresIn: 123,
        });
        expect(result.tokenType).toBe('Bearer');
      });
    });
  });
}); 