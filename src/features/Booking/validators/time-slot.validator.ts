import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import {
  VALID_TIME_SLOTS,
  TIME_SLOT_REGEX,
} from '../constants/time-slots.constants';

@ValidatorConstraint({ name: 'isValidTimeSlot', async: false })
export class IsValidTimeSlot implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value || typeof value !== 'string') {
      return false;
    }

    if (!TIME_SLOT_REGEX.test(value)) {
      return false;
    }

    return VALID_TIME_SLOTS.includes(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `Time slot must be one of the following: ${VALID_TIME_SLOTS.join(', ')}`;
  }
}
