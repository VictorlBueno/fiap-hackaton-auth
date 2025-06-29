export class AuthResult {
    constructor(
        public readonly accessToken: string,
        public readonly refreshToken: string,
        public readonly idToken: string,
        public readonly expiresIn: number,
        public readonly tokenType: string = 'Bearer'
    ) {}

    static create(data: {
        accessToken: string;
        refreshToken: string;
        idToken: string;
        expiresIn: number;
        tokenType?: string;
    }): AuthResult {
        return new AuthResult(
            data.accessToken,
            data.refreshToken,
            data.idToken,
            data.expiresIn,
            data.tokenType || 'Bearer'
        );
    }
}

