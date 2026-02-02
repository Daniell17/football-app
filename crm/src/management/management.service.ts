import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/shared';
import { CreateManagementDto } from './dto/create-management.dto';
import { UpdateManagementDto } from './dto/update-management.dto';

@Injectable()
export class ManagementService {
  constructor(private prisma: PrismaService) {}

  async create(createManagementDto: CreateManagementDto) {
    return this.prisma.management.create({
      data: createManagementDto,
    });
  }

  async findAll() {
    return this.prisma.management.findMany({
      orderBy: [{ role: 'asc' }, { fullName: 'asc' }],
    });
  }

  async findOne(id: string) {
    const staff = await this.prisma.management.findUnique({
      where: { id },
    });
    if (!staff) {
      throw new NotFoundException(`Management member with ID ${id} not found`);
    }
    return staff;
  }

  async update(id: string, updateManagementDto: UpdateManagementDto) {
    await this.findOne(id);
    return this.prisma.management.update({
      where: { id },
      data: updateManagementDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.management.delete({
      where: { id },
    });
  }
}
