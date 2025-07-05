import { User } from './user.entity';

describe('User Entity', () => {
  describe('Given the create method', () => {
    describe('When createdAt is provided', () => {
      it('Then should create user with the provided date', () => {
        const date = new Date('2023-01-01T00:00:00Z');
        const user = User.create({
          id: '1',
          email: 'a@b.com',
          name: 'Name',
          createdAt: date,
        });
        expect(user.createdAt).toBe(date);
      });
    });

    describe('When createdAt is not provided', () => {
      it('Then should create user with current date', () => {
        const before = new Date();
        const user = User.create({
          id: '1',
          email: 'a@b.com',
          name: 'Name',
        });
        const after = new Date();
        expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      });
    });

    describe('When isEmailVerified is true', () => {
      it('Then should create user with isEmailVerified true', () => {
        const user = User.create({
          id: '1',
          email: 'a@b.com',
          name: 'Name',
          isEmailVerified: true,
        });
        expect(user.isEmailVerified).toBe(true);
      });
    });

    describe('When isEmailVerified is false', () => {
      it('Then should create user with isEmailVerified false', () => {
        const user = User.create({
          id: '1',
          email: 'a@b.com',
          name: 'Name',
          isEmailVerified: false,
        });
        expect(user.isEmailVerified).toBe(false);
      });
    });

    describe('When isEmailVerified is not provided', () => {
      it('Then should create user with isEmailVerified true by default', () => {
        const user = User.create({
          id: '1',
          email: 'a@b.com',
          name: 'Name',
        });
        expect(user.isEmailVerified).toBe(true);
      });
    });
  });
}); 