import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { User } from "./user.entity";
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;

    beforeEach(async () => {
        // Create a fake copy of the users service
        const users: User[] = [];
        fakeUsersService = {
            find: (email: string) => {
                const filteredUsers = users.filter(user => user.email === email);
                return Promise.resolve(filteredUsers);
            },
            create: (email: string, password: string) => {
                const user = { id: Math.floor(Math.random() * 999999), email, password } as User;
                users.push(user)
                return Promise.resolve(user);
            }
        }
        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: fakeUsersService
                }
            ]
        }).compile();

        service = module.get(AuthService);
    });

    it('Can create an istance of auth service', async () => {
        expect(service).toBeDefined();
    });

    it('Creates a new user with a salted and hashed password', async () => {
        const user = await service.signup('autotest@test.com', '123456');

        expect(user.password).not.toEqual('123456');
        const [salt, hashed] = user.password.split('.')
        expect(salt).toBeDefined();
        expect(hashed).toBeDefined();
    });

    it('throws an error if user signs up with email that is in use', async () => {
        await service.signup('autotest@test.com', '123456');
        await expect(service.signup('autotest@test.com', '123456')).rejects.toThrow(BadRequestException);
    });

    it('throws if signin is called with an unused email', async () => {
        await expect(service.signin('autotest@test.com', 'passowrd')).rejects.toThrow(NotFoundException);
    });

    it('throws if an invalid password is provided', async () => {
        await service.signup('autotest@test.com', '123456');
        await expect(service.signin('autotest@test.com', 'passowrd')).rejects.toThrow(BadRequestException);
    });

    it('returns a user if correct password is provided', async () => {
        await service.signup('autotest@test.com', '123456');

        const user = await service.signin('autotest@test.com', '123456');
        expect(user).toBeDefined();
    });
})