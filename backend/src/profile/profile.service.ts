import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { SupabaseRequestService } from 'src/supabase/supabase-request.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly supabase: SupabaseRequestService,
    private readonly configService: ConfigService,
  ) {}

  async getProfile() {
    const {
      data: { user },
      error: authError,
    } = await this.supabase.client.auth.getUser();
    if (authError || !user) {
      throw new NotFoundException('Authenticated session not found.');
    }

    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('id, name, email, profile_image_url')
      .eq('id', user.id)
      .single();
    if (!data || error) {
      throw new NotFoundException('User profile not found in database.');
    }

    return data;
  }

  async updateProfile(name: string, file?: Express.Multer.File) {
    const {
      data: { user },
      error: authError,
    } = await this.supabase.client.auth.getUser();
    if (authError || !user) {
      throw new NotFoundException('Authenticated session not found.');
    }

    let publicUrl: string | null = null;

    // If a new file was uploaded process it into Supabase Bucket
    if (file) {
      const fileExt = file.originalname.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload the raw file buffer directly to your Supabase bucket (e.g., named 'avatars')
      const { error: uploadError } = await this.supabase.client.storage
        .from('avatars')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true, // Overwrites if the path somehow collides
        });
      if (uploadError) {
        throw new BadRequestException(
          `Storage upload failed: ${uploadError.message}`,
        );
      }

      // Generate the public access URL for the newly uploaded file asset
      const { data: urlData } = this.supabase.client.storage
        .from('avatars')
        .getPublicUrl(filePath);
      publicUrl = urlData.publicUrl;
    }

    // Update the database record matching this specific user's ID
    const updateData: any = { name };
    if (publicUrl) {
      updateData.profile_image_url = publicUrl;
    }

    const { data, error } = await this.supabase.client
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select('id, name, profile_image_url')
      .single();

    if (error || !data) {
      throw new BadRequestException(
        `Failed to save database changes: ${error?.message}`,
      );
    }

    return data;
  }

  async deleteAccount(password: string) {
    const {
      data: { user },
      error: authError,
    } = await this.supabase.client.auth.getUser();
    if (authError || !user) {
      throw new NotFoundException('Authenticated session not found.');
    }
    if (!password) {
      throw new BadRequestException('Password confirmation is required.');
    }

    // Security Check
    const { error: verifyError } =
      await this.supabase.client.auth.signInWithPassword({
        email: user.email!,
        password: password,
      });
    if (verifyError) {
      throw new UnauthorizedException(
        'Incorrect password. Account deletion aborted.',
      );
    }

    // Clean all the files related to user
    const { data: files } = await this.supabase.client.storage
      .from('avatars')
      .list(user.id);
    if (files && files.length > 0) {
      const filesToDelete = files.map((f) => `${user.id}/${f.name}`);
      await this.supabase.client.storage.from('avatars').remove(filesToDelete);
    }

    // Using SupabaseAdmin to delete user
    const supabaseAdmin = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!, // ⚠️ NEVER expose this key to frontends!
      { auth: { persistSession: false } },
    );
    const { error: adminDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (adminDeleteError) {
      throw new BadRequestException(
        `Failed to erase Auth record: ${adminDeleteError.message}`,
      );
    }
  }
}
