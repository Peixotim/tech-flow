// import { Repository } from 'typeorm';
// import { UsersEntity } from './entity/users.entity';
// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersService } from './users.service';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { PasswordService } from '../crypto/password.service';
// import { UserCreateDTO } from './DTOs/users-create.dto';

// describe('usersService', () => {
//   let usersService: UsersService;
//   let usersRepository: Repository<UsersEntity>;
//   //let passwordService: PasswordService;
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         UsersService,
//         {
//           provide: getRepositoryToken(UsersEntity),
//           useValue: {
//             create: jest.fn(),
//             save: jest.fn(),
//             findOne: jest.fn(),
//           },
//         },
//         {
//           provide: PasswordService,
//           useValue: {
//             hash: jest.fn().mockName('hash'),
//             verify: jest.fn().mockName('verify'),
//           },
//         },
//       ],
//     }).compile();

//     usersService = module.get<UsersService>(UsersService);
//     usersRepository = module.get<Repository<UsersEntity>>(
//       getRepositoryToken(UsersEntity),
//     );
//     passwordService = module.get<PasswordService>(PasswordService);
//   });

//   it('userService must be defined', () => {
//     expect(usersService).toBeDefined();
//     expect(usersRepository).toBeDefined();
//   });

//   // describe('create', () => {
//   //   it('you must create a user', async () => {
//   //     const userCreate: UserCreateDTO = {
//   //       name: 'Pedro',
//   //       email: 'pedropeixotovz@gmail.com',
//   //       password: 'pedro1234',
//   //     };

//   //     const passwordHashed: string = await passwordService.hash(
//   //       userCreate.password,
//   //     );

//   //     const newUser: UsersEntity = {
//   //       uuid: 'uuid-testing',
//   //       name: userCreate.name,
//   //       email: userCreate.email,
//   //       password: passwordHashed,
//   //       createdAt: new Date(),
//   //       updatedAt: new Date(),
//   //       isActive: true,
//   //     };
//   //     jest.spyOn(passwordService, 'hash').mockResolvedValue(passwordHashed);
//   //     jest.spyOn(usersRepository, 'create').mockResolvedValue(newUser as never);
//   //     jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
//   //     jest.spyOn(usersRepository, 'save').mockResolvedValue({
//   //       ...newUser,
//   //       password: undefined,
//   //     } as never);
//   //     const result = await usersService.createUser(userCreate);

//   //     // eslint-disable-next-line @typescript-eslint/unbound-method
//   //     expect(passwordService.hash).toHaveBeenCalledWith(userCreate.password);

//   //     // eslint-disable-next-line @typescript-eslint/unbound-method
//   //     expect(usersRepository.create).toHaveBeenCalledWith({
//   //       name: userCreate.name,
//   //       email: userCreate.email,
//   //       password: passwordHashed,
//   //     });

//   //     expect(result).toEqual(newUser);
//   //   });
//   // });
// });
