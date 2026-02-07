import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, UserSelect, PaginatedResponse, buildPrismaQuery, getPaginationMeta, SafeUser } from '@app/shared';
import { Prisma, User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll(query: UserFilterDto): Promise<PaginatedResponse<SafeUser>> {
    const { role, isActive, ...paginationQuery } = query;
    
    // Define entity-specific filters
    const filters: Prisma.UserWhereInput = {};
    if (role) filters.role = role;
    if (isActive !== undefined) filters.isActive = isActive;

    const prismaQuery = buildPrismaQuery(
      paginationQuery,
      ['email', 'firstName', 'lastName'], // Searchable fields
      filters
    );

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        ...prismaQuery,
        select: UserSelect,
      }),
      this.prisma.user.count({ where: prismaQuery.where }),
    ]);

    return {
      data,
      meta: getPaginationMeta(total, query.page || 1, query.limit || 10),
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: UserSelect,
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async setResetToken(id: string, token: string, expires: Date) {
    return this.prisma.user.update({
      where: { id },
      data: {
        resetToken: token,
        resetExpires: expires,
      },
    });
  }

  async findByResetToken(token: string) {
    return this.prisma.user.findUnique({
      where: { resetToken: token },
    });
  }

  async updatePassword(id: string, hash: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        password: hash,
        resetToken: null,
        resetExpires: null,
        refreshToken: null, // Force logout on all devices
      },
    });
  }
}
