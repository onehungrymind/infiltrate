import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { RegisterDto } from '../auth/dto/register.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password (always required for new users)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    const user = this.usersRepository.create({
      email: createUserDto.email,
      name: createUserDto.name,
      password: hashedPassword,
      isActive: createUserDto.isActive ?? true,
      role: createUserDto.role || 'user', // Default to 'user' if no role provided
    });

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'name', 'email', 'isActive', 'role', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: string): Promise<User> {
    // Use query builder to explicitly select all fields including password
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.name',
        'user.password', // Explicitly select password
        'user.isActive',
        'user.role',
        'user.createdAt',
        'user.updatedAt',
      ])
      .where('user.id = :id', { id })
      .getOne();
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // Return plain object to ensure password is included in JSON response
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password, // Explicitly include password
      isActive: user.isActive,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as User;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if password has changed (compare with existing hash)
    // If password is the same as the existing hash, don't update it
    // If password is different, hash the new password
    if (updateUserDto.password) {
      if (updateUserDto.password !== user.password) {
        // Password has changed, hash the new password
        const saltRounds = 12;
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
      } else {
        // Password hasn't changed (still the hash), don't update it
        delete updateUserDto.password;
      }
    }

    // Ensure role defaults to 'user' if not provided or empty
    if (!updateUserDto.role || updateUserDto.role === '') {
      updateUserDto.role = 'user';
    }

    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  // Auth-related methods (kept for backward compatibility)
  async createFromRegister(registerDto: RegisterDto): Promise<User> {
    return this.create({
      email: registerDto.email,
      name: registerDto.name,
      password: registerDto.password,
      role: registerDto.role,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

