import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';

import UpdateAccountCommand from '@src/account/application/command/implements/update.account';

import AccountRepository from '@src/account/domain/repository';

@CommandHandler(UpdateAccountCommand)
export default class UpdateAccountCommandHandler implements ICommandHandler<UpdateAccountCommand> {
  constructor(
    @Inject('AccountRepositoryImplement') private readonly accountRepository: AccountRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  public async execute(command: UpdateAccountCommand): Promise<void> {
    const { id, oldPassword, newPassword } = command;
    const model = await this.accountRepository.findById(id);
    if (!model) throw new NotFoundException();

    const account = this.eventPublisher.mergeObjectContext(model);

    await account.updatePassword(oldPassword, newPassword);

    account.commit();

    await this.accountRepository.save(account);
  }
}
