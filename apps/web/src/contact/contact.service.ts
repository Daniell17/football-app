import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/shared';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async create(createContactDto: CreateContactDto) {
    return this.prisma.contactMessage.create({
      data: createContactDto,
    });
  }
}
