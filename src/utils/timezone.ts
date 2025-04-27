import { DateTime } from 'luxon';

const toSeoulTime = (date?: Date | string): DateTime => {
  return DateTime.fromJSDate(date ? new Date(date) : new Date()).setZone('Asia/Seoul');
};

const toUTCDate = (date: Date | string): Date => {
  return DateTime.fromJSDate(date ? new Date(date) : new Date()).toUTC().toJSDate();
};

const formatDate = (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
  return toSeoulTime(date).toFormat(format);
};

export { toSeoulTime, toUTCDate, formatDate };
