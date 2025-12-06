import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UpdateAddressDto } from '../../dto/update-user-address.dto';
import { CreateAddressDto } from '../../dto/user-address.dto';
import { UserAddressService } from './user-address.service';
import { AuthGuardWithRoles } from 'src/guards/authGuart';


@Controller('addresses')
@UseGuards(AuthGuardWithRoles)
export class UserAddressController {
  constructor(private readonly addressService: UserAddressService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateAddressDto) {
    console.log('Address create called with dto:', JSON.stringify(dto));
    console.log('req.user:', req.user ? JSON.stringify({ sub: req.user.sub, email: req.user.email }) : 'undefined');
    try {
      const userId = req.user.sub || req.user._id;
      const result = await this.addressService.create(userId, dto);
      console.log('Address created successfully:', result);
      return result.toJSON();
    } catch (error) {
      console.error('Error in address controller:', error.message, error.stack);
      throw error;
    }
  }

  @Get()
  async findUserAddresses(@Req() req) {
    console.log('req.user:', req.user ? JSON.stringify({ sub: req.user.sub, email: req.user.email }) : 'undefined');
    
    const userId = req.user.sub || req.user._id;
    if (!userId) {
      throw new Error('User not authenticated or user ID not found');
    }
    console.log('Fetching addresses for userId:', userId);
    const addresses = await this.addressService.findUserAddresses(userId);
    console.log(`Found ${addresses.length} addresses for user ${userId}`);
    return addresses.map(addr => addr.toJSON());
  }

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    const userId = req.user.sub || req.user._id;
    const result = await this.addressService.update(userId, id, dto);
    return result.toJSON();
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    const userId = req.user.sub || req.user._id;
    return this.addressService.remove(userId, id);
  }
}
