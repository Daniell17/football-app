import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/shared';

@Injectable()
export class ManagementService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.management.findMany({
      where: { isActive: true },
      orderBy: [{ role: 'asc' }, { fullName: 'asc' }],
    });
  }

  async findOne(id: string) {
    const staff = await this.prisma.management.findUnique({
      where: { id, isActive: true },
    });
    if (!staff) {
      throw new NotFoundException(`Management member with ID ${id} not found`);
    }
    return staff;
  }
}
