import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { SupabaseGuard } from 'src/supabase/guards/supabase.guard';
import { ProfileService } from './profile.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('profile')
@ApiBearerAuth('access-token')
@UseGuards(SupabaseGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile() {
    return this.profileService.getProfile();
  }

  @Patch()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfile(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
  ) {
    return this.profileService.updateProfile(name, file);
  }

  @Delete()
  async deleteAccount(@Body('password') password: string) {
    await this.profileService.deleteAccount(password);

    return {
      message: 'Account and associated data deleted successfully.',
    };
  }
}
