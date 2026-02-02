import {
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
  PureAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';

export type Subjects = 'Match' | 'Ticket' | 'News' | 'Player' | 'User' | 'all';

export type AppAbility = PureAbility<[string, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(PureAbility as AbilityClass<AppAbility>);

    if (user.role === UserRole.ADMIN) {
      can('manage', 'all');
    } else {
      can('read', 'all');
      
      can('update', 'User', { id: user.id });
      can('read', 'Ticket', { userId: user.id });
      
      cannot('manage', 'Match');
      cannot('manage', 'News');
      cannot('manage', 'Player');
    }

    return build({
      detectSubjectType: (item: any) => item.__typename || item.constructor?.name,
    });
  }
}
