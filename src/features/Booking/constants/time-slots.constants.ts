export interface TimeSlotConfig {
  id: string;
  startTime: string;
  endTime: string;
  displayTime: string;
}

export const TIME_SLOTS: TimeSlotConfig[] = [
  { id: 'slot-1', startTime: '06:30', endTime: '07:45', displayTime: '06:30 - 07:45' },
  { id: 'slot-2', startTime: '07:45', endTime: '09:00', displayTime: '07:45 - 09:00' },
  { id: 'slot-3', startTime: '09:00', endTime: '10:15', displayTime: '09:00 - 10:15' },
  { id: 'slot-4', startTime: '10:15', endTime: '11:30', displayTime: '10:15 - 11:30' },
  { id: 'slot-5', startTime: '11:30', endTime: '12:45', displayTime: '11:30 - 12:45' },
  { id: 'slot-6', startTime: '12:45', endTime: '14:00', displayTime: '12:45 - 14:00' },
  { id: 'slot-7', startTime: '14:00', endTime: '15:15', displayTime: '14:00 - 15:15' },
  { id: 'slot-8', startTime: '15:15', endTime: '16:30', displayTime: '15:15 - 16:30' },
  { id: 'slot-9', startTime: '16:30', endTime: '17:45', displayTime: '16:30 - 17:45' },
  { id: 'slot-10', startTime: '17:45', endTime: '19:00', displayTime: '17:45 - 19:00' },
  { id: 'slot-11', startTime: '19:00', endTime: '20:15', displayTime: '19:00 - 20:15' },
];

export const VALID_TIME_SLOTS = TIME_SLOTS.map(slot => slot.displayTime);


export const BOOKINGS_PER_EMPLOYEE = 1;

// Time slot regex for validation
export const TIME_SLOT_REGEX = /^\d{2}:\d{2} - \d{2}:\d{2}$/;
