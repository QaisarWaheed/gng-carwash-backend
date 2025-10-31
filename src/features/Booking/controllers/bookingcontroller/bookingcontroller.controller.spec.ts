import { Test, TestingModule } from '@nestjs/testing';
import { BookingcontrollerController } from './bookingcontroller.controller';

describe('BookingcontrollerController', () => {
  let controller: BookingcontrollerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingcontrollerController],
    }).compile();

    controller = module.get<BookingcontrollerController>(BookingcontrollerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
