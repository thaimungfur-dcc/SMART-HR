// Shift Options
export const SHIFTS = [
  { id: 'S1', name: 'Regular Shift (08:30 - 17:30)', start: '08:30', end: '17:30' },
  { id: 'S2', name: 'Morning Shift (07:00 - 16:00)', start: '07:00', end: '16:00' },
  { id: 'S3', name: 'Afternoon Shift (13:00 - 22:00)', start: '13:00', end: '22:00' },
  { id: 'S4', name: 'Night Shift (22:00 - 07:00)', start: '22:00', end: '07:00' }
];

// Seed Historical Monthly Trends
export const MONTHLY_HISTORICAL_TRENDS_MAP: Record<string, { month: string; present: number; late: number; leave: number; avgHours: number }[]> = {
  'U001': [
    { month: 'Dec 2025', present: 20, late: 1, leave: 1, avgHours: 8.2 },
    { month: 'Jan 2026', present: 21, late: 2, leave: 0, avgHours: 8.4 },
    { month: 'Feb 2026', present: 19, late: 1, leave: 0, avgHours: 8.1 },
    { month: 'Mar 2026', present: 22, late: 0, leave: 1, avgHours: 8.3 },
    { month: 'Apr 2026', present: 18, late: 3, leave: 2, avgHours: 8.5 },
    { month: 'May 2026', present: 20, late: 1, leave: 1, avgHours: 8.2 },
  ],
  'U002': [
    { month: 'Dec 2025', present: 21, late: 0, leave: 1, avgHours: 8.5 },
    { month: 'Jan 2026', present: 20, late: 3, leave: 0, avgHours: 8.3 },
    { month: 'Feb 2026', present: 18, late: 2, leave: 0, avgHours: 8.2 },
    { month: 'Mar 2026', present: 21, late: 1, leave: 1, avgHours: 8.6 },
    { month: 'Apr 2026', present: 19, late: 2, leave: 2, avgHours: 8.4 },
    { month: 'May 2026', present: 20, late: 1, leave: 1, avgHours: 8.3 },
  ],
  'U003': [
    { month: 'Dec 2025', present: 19, late: 2, leave: 1, avgHours: 8.0 },
    { month: 'Jan 2026', present: 22, late: 1, leave: 0, avgHours: 8.2 },
    { month: 'Feb 2026', present: 17, late: 3, leave: 0, avgHours: 8.1 },
    { month: 'Mar 2026', present: 20, late: 2, leave: 1, avgHours: 8.3 },
    { month: 'Apr 2026', present: 19, late: 1, leave: 3, avgHours: 8.0 },
    { month: 'May 2026', present: 21, late: 1, leave: 0, avgHours: 8.2 },
  ],
  'U004': [
    { month: 'Dec 2025', present: 22, late: 0, leave: 0, avgHours: 8.3 },
    { month: 'Jan 2026', present: 21, late: 1, leave: 1, avgHours: 8.4 },
    { month: 'Feb 2026', present: 19, late: 1, leave: 0, avgHours: 8.2 },
    { month: 'Mar 2026', present: 21, late: 1, leave: 1, avgHours: 8.3 },
    { month: 'Apr 2026', present: 20, late: 2, leave: 0, avgHours: 8.5 },
    { month: 'May 2026', present: 22, late: 0, leave: 0, avgHours: 8.4 },
  ],
  'U005': [
    { month: 'Dec 2025', present: 18, late: 3, leave: 1, avgHours: 8.0 },
    { month: 'Jan 2026', present: 19, late: 2, leave: 1, avgHours: 8.1 },
    { month: 'Feb 2026', present: 17, late: 3, leave: 0, avgHours: 8.0 },
    { month: 'Mar 2026', present: 20, late: 2, leave: 1, avgHours: 8.2 },
    { month: 'Apr 2026', present: 18, late: 3, leave: 2, avgHours: 8.1 },
    { month: 'May 2026', present: 19, late: 2, leave: 1, avgHours: 8.0 },
  ],
  'default': [
    { month: 'Dec 2025', present: 20, late: 1, leave: 1, avgHours: 8.1 },
    { month: 'Jan 2026', present: 21, late: 1, leave: 1, avgHours: 8.3 },
    { month: 'Feb 2026', present: 19, late: 2, leave: 0, avgHours: 8.2 },
    { month: 'Mar 2026', present: 22, late: 0, leave: 1, avgHours: 8.4 },
    { month: 'Apr 2026', present: 18, late: 2, leave: 2, avgHours: 8.2 },
    { month: 'May 2026', present: 20, late: 2, leave: 1, avgHours: 8.3 },
  ]
};

export const BASELINE_LOGS = [
  { id: 'att-b1', employeeId: 'U001', date: '2026-06-01', checkIn: '08:24', checkOut: '17:35', status: 'Present', hours: 9.18, shift: 'Regular Shift', mode: 'Office' },
  { id: 'att-b2', employeeId: 'U001', date: '2026-06-02', checkIn: '08:28', checkOut: '17:32', status: 'Present', hours: 9.07, shift: 'Regular Shift', mode: 'Office' },
  { id: 'att-b3', employeeId: 'U001', date: '2026-06-03', checkIn: '08:35', checkOut: '17:40', status: 'Late', hours: 9.08, shift: 'Regular Shift', mode: 'Office' },
  { id: 'att-b4', employeeId: 'U001', date: '2026-06-04', checkIn: '08:15', checkOut: '17:05', status: 'Present', hours: 8.83, shift: 'Regular Shift', mode: 'Office' },
  
  { id: 'att-b5', employeeId: 'U002', date: '2026-06-01', checkIn: '08:12', checkOut: '17:31', status: 'Present', hours: 9.32, shift: 'Regular Shift', mode: 'Office' },
  { id: 'att-b6', employeeId: 'U002', date: '2026-06-02', checkIn: '08:18', checkOut: '17:42', status: 'Present', hours: 9.40, shift: 'Regular Shift', mode: 'Office' },
  { id: 'att-b7', employeeId: 'U002', date: '2026-06-03', checkIn: '08:15', checkOut: '17:30', status: 'Present', hours: 9.25, shift: 'Regular Shift', mode: 'Remote' },
  { id: 'att-b8', employeeId: 'U002', date: '2026-06-04', checkIn: '08:42', checkOut: '17:30', status: 'Late', hours: 8.80, shift: 'Regular Shift', mode: 'Office' },
  
  { id: 'att-b9', employeeId: 'U003', date: '2026-06-01', checkIn: '08:25', checkOut: '17:45', status: 'Present', hours: 9.33, shift: 'Regular Shift', mode: 'Office' },
  { id: 'att-b10', employeeId: 'U003', date: '2026-06-02', checkIn: '08:39', checkOut: '18:10', status: 'Late', hours: 9.51, shift: 'Regular Shift', mode: 'Office' },
  { id: 'att-b11', employeeId: 'U003', date: '2026-06-03', checkIn: '08:21', checkOut: '17:30', status: 'Present', hours: 9.15, shift: 'Regular Shift', mode: 'Office' },
  { id: 'att-b12', employeeId: 'U003', date: '2026-06-04', checkIn: '08:11', checkOut: '17:28', status: 'Present', hours: 9.28, shift: 'Regular Shift', mode: 'Office' },
];

