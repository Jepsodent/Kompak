import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService:ConfigService) => ({
      secret: configService.get<string>('INV_JWT_SECRET'),
      signOptions: {
        expiresIn: configService.get('INV_JWT_EXPIRES_IN'),
      },
    }),
  })],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
