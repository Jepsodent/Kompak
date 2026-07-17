import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { SupabaseRequestService } from 'src/supabase/supabase-request.service';
import { NotFoundException } from '@nestjs/common';

describe('ProjectsService', () => {
  let service:ProjectsService
  let supabaseService: SupabaseRequestService

  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: SupabaseRequestService,
          useValue: {
            client: mockSupabaseClient,
          }
        }
      ]
    }).compile()
    service = module.get<ProjectsService>(ProjectsService);
    supabaseService = module.get<SupabaseRequestService>(SupabaseRequestService);
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  describe('getProjectById', () => {
    it('harus mengembalikan data project kalau project ditemukan', async () => {
      // A. Siapkan data palsu
      const fakeProject = { id: '123', title: 'Project Tester' };
      
      // B. Atur supaya fungsi .single() dari fake Supabase me-return data tersebut
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: fakeProject,
        error: null,
      });
      // C. Eksekusi fungsi yang mau dites
      const result = await service.getProjectById('123');
      // D. Buktikan hasilnya bener
      expect(result).toEqual(fakeProject);
      
      // (Opsional) Buktikan kalau fungsi .from() beneran dipanggil dengan parameter 'projects'
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('projects');
    });

    it('harus melempar NotFoundException kalau project tidak ada', async () => {
      // A. Atur supaya fungsi .single() me-return error (simulasi data tidak ketemu)
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });
      // B. Eksekusi dan buktikan kalau dia nge-lempar Exception
      await expect(service.getProjectById('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });



});
