import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getServiceAvailability(): string {
    return 'Server is running';
  }
}
