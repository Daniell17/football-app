import {
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
  PureAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';

export type Subjects = 'Match' | 'Ticket' | 'News' | 'Player' | 'User' | 'Payment' | 'all';

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
      can('read', 'Payment', { userId: user.id });
      
      cannot('manage', 'Match');
      cannot('manage', 'News');
      cannot('manage', 'Player');
    }

    return build({
      detectSubjectType: (item: Record<string, unknown>) => 
        (item.__typename || (item.constructor as { name: string }).name) as ExtractSubjectType<Subjects>,
    });
  }
}
