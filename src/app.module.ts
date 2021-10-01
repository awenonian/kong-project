import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServicesController } from './services/services.controller';

@Module({
  imports: [],
  controllers: [AppController, ServicesController],
  providers: [AppService],
})
export class AppModule {}
