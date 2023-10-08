import {Transform, TransformationType} from 'class-transformer';
import {format, parseISO} from 'date-fns';

export function SimpleDateTransform() {
  return Transform(params => {
    const value = params.value;
    const type = params.type;

    /* Inbound case - only consider the part of the timestamp string that signifies the date (ISO format: yyyy-MM-dd) */
    if (type === TransformationType.PLAIN_TO_CLASS && typeof value === 'string') {
      const matchGroups = /\d\d\d\d-\d\d-\d\d/.exec(value);
      return matchGroups && matchGroups.length ? parseISO(matchGroups[0]) : null;
    }

    /* Outbound case - convert to a string that expresses only the year/month/day of the set date. */
    else if (type === TransformationType.CLASS_TO_PLAIN && value instanceof Date) {
      return format(value, 'yyyy-MM-dd');
    }

    return value;
  })
}
