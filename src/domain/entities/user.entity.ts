export class User {
  constructor(
      public readonly id: string,
      public readonly email: string,
      public readonly name: string,
      public readonly createdAt: Date,
      public readonly isEmailVerified: boolean = true
  ) {}

  static create(data: {
    id: string;
    email: string;
    name: string;
    createdAt?: Date;
    isEmailVerified?: boolean;
  }): User {
    return new User(
        data.id,
        data.email,
        data.name,
        data.createdAt || new Date(),
        data.isEmailVerified ?? true
    );
  }
}