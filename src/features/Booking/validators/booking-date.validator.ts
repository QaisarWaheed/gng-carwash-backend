import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { getDubaiDayStart, getDubaiNow } from 'src/utils/timezone.utils';

@ValidatorConstraint({ name: 'isValidBookingDate', async: false })
export class IsValidBookingDate implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value) {
      return false;
    }

    const bookingDate = getDubaiDayStart(new Date(value));
    const today = getDubaiDayStart(getDubaiNow());

    if (bookingDate < today) {
      return false;
    }

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 7);

    if (bookingDate > maxDate) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Booking date must be within the next 7 days and cannot be in the past (Dubai time)';
  }
}
