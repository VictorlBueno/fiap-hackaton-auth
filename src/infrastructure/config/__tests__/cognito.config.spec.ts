import { getCognitoConfig } from '../cognito.config';

describe('getCognitoConfig', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should return default values if environment variables are not defined', () => {
    delete process.env.AWS_REGION;
    delete process.env.COGNITO_USER_POOL_ID;
    delete process.env.COGNITO_CLIENT_ID;
    delete process.env.COGNITO_CLIENT_SECRET;
    const config = getCognitoConfig();
    expect(config.region).toBe('us-east-1');
    expect(config.userPoolId).toBe('');
    expect(config.clientId).toBe('');
    expect(config.clientSecret).toBeUndefined();
  });

  it('should return values from environment variables', () => {
    process.env.AWS_REGION = 'sa-east-1';
    process.env.COGNITO_USER_POOL_ID = 'pool';
    process.env.COGNITO_CLIENT_ID = 'client';
    process.env.COGNITO_CLIENT_SECRET = 'secret';
    const config = getCognitoConfig();
    expect(config.region).toBe('sa-east-1');
    expect(config.userPoolId).toBe('pool');
    expect(config.clientId).toBe('client');
    expect(config.clientSecret).toBe('secret');
  });
}); 