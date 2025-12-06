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
import { VerifiedUserGuard } from 'src/guards/verifiedUser.guard';
import { Roles } from 'src/decorators/Roles.decorator';
import { Role } from 'src/types/enum.class';

@Controller('addresses')
@UseGuards(AuthGuardWithRoles)
@Roles(Role.User)
export class UserAddressController {
  constructor(private readonly addressService: UserAddressService) {}

  @Post()
  @UseGuards(VerifiedUserGuard)
  create(@Req() req, @Body() dto: CreateAddressDto) {
    return this.addressService.create(req.user._id, dto);
  }

  @Get()
  findUserAddresses(@Req() req) {
    return this.addressService.findUserAddresses(req.user._id);
  }

  @Get('user/:userId')
  findAddressesByUserId(@Param('userId') userId: string) {
    return this.addressService.findUserAddresses(userId);
  }

  @Patch(':id')
  @UseGuards(VerifiedUserGuard)
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.addressService.update(req.user._id, id, dto);
  }

  @Delete(':id')
  @UseGuards(VerifiedUserGuard)
  remove(@Req() req, @Param('id') id: string) {
    return this.addressService.remove(req.user._id, id);
  }
}
