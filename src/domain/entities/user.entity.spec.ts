import { User } from './user.entity';

describe('User Entity', () => {
  describe('Given o método create', () => {
    describe('When createdAt é fornecido', () => {
      it('Then deve criar o usuário com a data informada', () => {
        const date = new Date('2023-01-01T00:00:00Z');
        const user = User.create({
          id: '1',
          email: 'a@b.com',
          name: 'Nome',
          createdAt: date,
        });
        expect(user.createdAt).toBe(date);
      });
    });

    describe('When createdAt não é fornecido', () => {
      it('Then deve criar o usuário com a data atual', () => {
        const before = new Date();
        const user = User.create({
          id: '1',
          email: 'a@b.com',
          name: 'Nome',
        });
        const after = new Date();
        expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      });
    });

    describe('When isEmailVerified é true', () => {
      it('Then deve criar o usuário com isEmailVerified true', () => {
        const user = User.create({
          id: '1',
          email: 'a@b.com',
          name: 'Nome',
          isEmailVerified: true,
        });
        expect(user.isEmailVerified).toBe(true);
      });
    });

    describe('When isEmailVerified é false', () => {
      it('Then deve criar o usuário com isEmailVerified false', () => {
        const user = User.create({
          id: '1',
          email: 'a@b.com',
          name: 'Nome',
          isEmailVerified: false,
        });
        expect(user.isEmailVerified).toBe(false);
      });
    });

    describe('When isEmailVerified não é fornecido', () => {
      it('Then deve criar o usuário com isEmailVerified true por padrão', () => {
        const user = User.create({
          id: '1',
          email: 'a@b.com',
          name: 'Nome',
        });
        expect(user.isEmailVerified).toBe(true);
      });
    });
  });
}); 