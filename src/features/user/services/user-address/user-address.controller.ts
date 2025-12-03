import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  Req,
} from '@nestjs/common';
import { UpdateAddressDto } from '../../dto/update-user-address.dto';
import { CreateAddressDto } from '../../dto/user-address.dto';
import { UserAddressService } from './user-address.service';


@Controller('addresses')
export class UserAddressController {
  constructor(private readonly addressService: UserAddressService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateAddressDto) {
    return this.addressService.create(req.user._id, dto);
  }

  @Get()
  findUserAddresses(@Req() req) {
    return this.addressService.findUserAddresses(req.user._id);
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.update(req.user._id, id, dto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.addressService.remove(req.user._id, id);
  }
}
