import {
    Body,
    Param,
    Query, 
    Controller, 
    Get, 
    Post, 
    Delete, 
    Patch, 
    NotFoundException
} from '@nestjs/common';
import { CreateUserDto } from './dots/create-user.dto';
import { UpdateUserDto } from './dots/update-user.dto';
import { UsersService } from './users.service';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dots/user.dto';

@Controller('auth')
@Serialize(UserDto)
export class UsersController {
    constructor(private userService: UsersService) { }

    @Post('/signup')
    createUser(@Body() body: CreateUserDto) {
        this.userService.create(body.email, body.password);
    }

    @Get('/:id')
    async findUser(@Param('id') id: string) {
        
        const user = await this.userService.findOne(parseInt(id));
        if (!user) {
            return new NotFoundException('User not found');
        }
        return user;
    }

    @Get()
    findAllUsers(@Query('email') email: string) {
        return this.userService.find(email);
    }

    @Patch('/:id')
    updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
        return this.userService.update(parseInt(id), body);
    }

    @Delete('/:id')
    removeUser(@Param('id') id: string) {
        return this.userService.remove(parseInt(id));
    }
}
