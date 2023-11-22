import * as moment from "moment";

export function getDateFormated(date: string, format = 'DD.MM.YY HH:mm') {
  if (!date) return '';

  return moment(date).format(format);
}