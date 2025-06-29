export class User {
    constructor(
        id: string,
        email: string,
        name: string,
        createdAt: Date,
        isEmailVerified?: boolean
    ) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.createdAt = createdAt;
        this.isEmailVerified = isEmailVerified || true;
    }

    private _id: string;

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    private _email: string;

    get email(): string {
        return this._email;
    }

    set email(value: string) {
        this._email = value;
    }

    private _name: string;

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    private _createdAt: Date;

    get createdAt(): Date {
        return this._createdAt;
    }

    set createdAt(value: Date) {
        this._createdAt = value;
    }

    private _isEmailVerified: boolean;

    get isEmailVerified(): boolean {
        return this._isEmailVerified;
    }

    set isEmailVerified(value: boolean) {
        this._isEmailVerified = value;
    }
}
