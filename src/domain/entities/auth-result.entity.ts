export class AuthResult {
    constructor(
        accessToken: string,
        refreshToken: string,
        idToken: string,
        expiresIn: number,
        tokenType?: string
    ) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.idToken = idToken;
        this.expiresIn = expiresIn;
        this.tokenType = tokenType || 'Bearer';
    }

    private _accessToken: string;

    get accessToken(): string {
        return this._accessToken;
    }

    set accessToken(value: string) {
        this._accessToken = value;
    }

    private _refreshToken: string;

    get refreshToken(): string {
        return this._refreshToken;
    }

    set refreshToken(value: string) {
        this._refreshToken = value;
    }

    private _idToken: string;

    get idToken(): string {
        return this._idToken;
    }

    set idToken(value: string) {
        this._idToken = value;
    }

    private _expiresIn: number;

    get expiresIn(): number {
        return this._expiresIn;
    }

    set expiresIn(value: number) {
        this._expiresIn = value;
    }

    private _tokenType: string;

    get tokenType(): string {
        return this._tokenType;
    }

    set tokenType(value: string) {
        this._tokenType = value;
    }
}
