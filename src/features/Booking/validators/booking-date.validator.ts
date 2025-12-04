import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidBookingDate', async: false })
export class IsValidBookingDate implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value) {
      return false;
    }

    const bookingDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if booking is in the past
    if (bookingDate < today) {
      return false;
    }

    // Check if booking is within 7 days
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 7);

    if (bookingDate > maxDate) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Booking date must be within the next 7 days and cannot be in the past';
  }
}
