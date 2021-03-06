import { BadRequestException, Provider } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { Test } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';

import CreateAccountCommandHandler from '@src/account/application/command/handlers/create.account';
import CreateAccountCommand from '@src/account/application/command/implements/create.account';

import AccountFactory from '@src/account/domain/factory';
import Account from '@src/account/domain/model/account';
import AccountRepository from '@src/account/domain/repository';

describe('CreateAccountHandler', () => {
  let accountRepository: AccountRepository;
  let accountFactory: AccountFactory;
  let eventPublisher: EventPublisher;
  let createAccountCommandHandler: CreateAccountCommandHandler;

  beforeEach(async () => {
    const accountFactoryProvider: Provider = { provide: AccountFactory, useValue: {} };
    const accountRepositoryProvider: Provider = {
      provide: 'AccountRepositoryImplement',
      useValue: {},
    };
    const eventPublisherProvider: Provider = { provide: EventPublisher, useValue: {} };

    const providers: Provider[] = [
      accountFactoryProvider,
      accountRepositoryProvider,
      eventPublisherProvider,
      CreateAccountCommandHandler,
    ];

    const moduleMetadata: ModuleMetadata = { providers };
    const testModule = await Test.createTestingModule(moduleMetadata).compile();

    accountRepository = testModule.get('AccountRepositoryImplement');
    accountFactory = testModule.get(AccountFactory);
    eventPublisher = testModule.get(EventPublisher);
    createAccountCommandHandler = testModule.get(CreateAccountCommandHandler);
  });

  describe('execute', () => {
    it('should throw BadRequestException when same email account is exists', async () => {
      const command = new CreateAccountCommand('email', 'password');

      accountRepository.findByEmail = jest.fn().mockResolvedValue([{} as Account]);

      await expect(createAccountCommandHandler.execute(command)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return Promise<void>', async () => {
      const command = new CreateAccountCommand('email', 'password');

      const account = {} as Account;
      account.commit = jest.fn().mockReturnValue(undefined);

      accountRepository.findByEmail = jest.fn().mockResolvedValue([]);
      accountRepository.newId = jest.fn().mockResolvedValue('id');
      accountFactory.create = jest.fn().mockReturnValue(account);
      eventPublisher.mergeObjectContext = jest.fn().mockReturnValue(account);
      accountRepository.save = jest.fn().mockResolvedValue(undefined);

      await expect(createAccountCommandHandler.execute(command)).resolves.toEqual(undefined);
    });
  });
});
