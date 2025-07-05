import { AuthResult } from './auth-result.entity';

describe('AuthResult Entity', () => {
  describe('Given the create method', () => {
    describe('When tokenType is provided', () => {
      it('Then should create an AuthResult with the provided tokenType', () => {
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

    describe('When tokenType is not provided', () => {
      it('Then should create an AuthResult with default tokenType "Bearer"', () => {
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