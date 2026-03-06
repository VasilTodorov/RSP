import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {AdminGuard} from '../auth/roles.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }

  @Get('me')
  getProfile(@Request() req) {
    return this.userService.findOne(req.user.userId);
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.userService.findAll();
  }

 @Get(':id')
 @UseGuards(AdminGuard)
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(+id);
    
    if (!user) {
      // This is where we get "loud" for the frontend
      throw new NotFoundException(`User with ID ${id} does not exist`);
    }
    
    return user;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto, 
    @Request() req // 2. Access the logged-in user's info
  ) {
    const loggedInUserId = req.user.userId;
    const targetUserId = +id;

    // 3. The Guard Check: Compare IDs
    if (loggedInUserId !== targetUserId) {
      throw new ForbiddenException('You are not allowed to edit another user’s profile!');
    }

    return this.userService.update(targetUserId, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
