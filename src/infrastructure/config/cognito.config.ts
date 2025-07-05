export interface CognitoConfig {
    region: string;
    userPoolId: string;
    clientId: string;
    clientSecret?: string;
}

export const getCognitoConfig = (): CognitoConfig => ({
    region: process.env.AWS_REGION || 'us-east-1',
    userPoolId: process.env.COGNITO_USER_POOL_ID || '',
    clientId: process.env.COGNITO_CLIENT_ID || '',
    clientSecret: process.env.COGNITO_CLIENT_SECRET,
});