import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, User } from '@repo/types';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async signup(createUserDto: CreateUserDto): Promise<User> {
    const data: Prisma.UserCreateInput = {
      id: randomUUID(),
      name: createUserDto.username,
      email: createUserDto.email,
      image: createUserDto.avatar_url,
    };
    return this.prisma.user.create({ data });
  }

  async login() {
    //Authenticate and get tokens
    return 'function for login';
  }

  async logout() {
    //Invalidate tokens
    return 'function for logout';
  }

  async findme() {
    //Get current user information
    return 'function to return current user information';
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
