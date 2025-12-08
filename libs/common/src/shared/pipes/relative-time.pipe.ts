import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class RelativeTimePipe implements PipeTransform {
  transform(timestamp: string): string {
    if (!timestamp) {
      throw new BadRequestException('Timestamp is required');
    }

    const now = new Date();
    const target = new Date(timestamp);

    if (isNaN(target.getTime())) {
      throw new BadRequestException('Invalid timestamp format');
    }

    const diffMs = target.getTime() - now.getTime();
    const diffSeconds = Math.round(diffMs / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    if (Math.abs(diffSeconds) < 60) {
      return diffSeconds > 0 ? 'in a few seconds' : 'a few seconds ago';
    }
    if (Math.abs(diffMinutes) < 60) {
      return diffMinutes > 0
        ? `in ${diffMinutes} minutes`
        : `${Math.abs(diffMinutes)} minutes ago`;
    }
    if (Math.abs(diffHours) < 24) {
      return diffHours > 0
        ? `in ${diffHours} hours`
        : `${Math.abs(diffHours)} hours ago`;
    }

    return diffDays > 0
      ? `in ${diffDays} days`
      : `${Math.abs(diffDays)} days ago`;
  }
}
