import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CampaignService } from './campaign.service';
import { environment } from '../../../environments/environment.development';
import { CampaignCategory, CampaignStatus } from '../models/campaign.model';

describe('CampaignService', () => {
  let service: CampaignService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/campaigns`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CampaignService],
    });
    service = TestBed.inject(CampaignService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── getAllCampaigns ───────────────────────────────────────────────────────

  describe('getAllCampaigns', () => {
    it('should send GET to /api/campaigns', () => {
      service.getAllCampaigns().subscribe();
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should return the campaigns returned by the server', () => {
      const mockCampaigns = [
        { id: '1', title: 'Camp A' },
        { id: '2', title: 'Camp B' },
      ];

      service.getAllCampaigns().subscribe(campaigns => {
        expect(campaigns.length).toBe(2);
        expect(campaigns[0].title).toBe('Camp A');
      });

      httpMock.expectOne(apiUrl).flush(mockCampaigns);
    });
  });

  // ── getCampaignById ──────────────────────────────────────────────────────

  describe('getCampaignById', () => {
    it('should send GET to /api/campaigns/:id', () => {
      service.getCampaignById('camp-1').subscribe();
      const req = httpMock.expectOne(`${apiUrl}/camp-1`);
      expect(req.request.method).toBe('GET');
      req.flush({ id: 'camp-1', title: 'A Campaign' });
    });

    it('should return the campaign object from the server', () => {
      const mockCampaign = { id: 'camp-1', title: 'Test' };

      service.getCampaignById('camp-1').subscribe(campaign => {
        expect(campaign).toEqual(mockCampaign);
      });

      httpMock.expectOne(`${apiUrl}/camp-1`).flush(mockCampaign);
    });
  });

  // ── searchCampaigns ──────────────────────────────────────────────────────

  describe('searchCampaigns', () => {
    it('should send GET to /api/campaigns/search', () => {
      service.searchCampaigns({}).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/search`);
      expect(req.request.method).toBe('GET');
      req.flush({ content: [], page: { size: 10, number: 0, totalElements: 0, totalPages: 0 } });
    });

    it('should include keyword param when provided', () => {
      service.searchCampaigns({ keyword: 'education' }).subscribe();
      const req = httpMock.expectOne(r => r.url === `${apiUrl}/search`);
      expect(req.request.params.get('keyword')).toBe('education');
      req.flush({ content: [], page: { size: 10, number: 0, totalElements: 0, totalPages: 0 } });
    });

    it('should include category param when provided', () => {
      service.searchCampaigns({ category: CampaignCategory.HEALTH }).subscribe();
      const req = httpMock.expectOne(r => r.url === `${apiUrl}/search`);
      expect(req.request.params.get('category')).toBe(CampaignCategory.HEALTH);
      req.flush({ content: [], page: { size: 10, number: 0, totalElements: 0, totalPages: 0 } });
    });

    it('should include page and size params when provided', () => {
      service.searchCampaigns({ page: 2, size: 5 }).subscribe();
      const req = httpMock.expectOne(r => r.url === `${apiUrl}/search`);
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('size')).toBe('5');
      req.flush({ content: [], page: { size: 5, number: 2, totalElements: 0, totalPages: 0 } });
    });

    it('should not include undefined params', () => {
      service.searchCampaigns({}).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/search`);
      expect(req.request.params.keys().length).toBe(0);
      req.flush({ content: [], page: { size: 10, number: 0, totalElements: 0, totalPages: 0 } });
    });
  });

  // ── getCampaignsByCategory ───────────────────────────────────────────────

  describe('getCampaignsByCategoryPaginated', () => {
    it('should send GET to /api/campaigns/category/:category with pagination params', () => {
      service.getCampaignsByCategoryPaginated(CampaignCategory.EDUCATION, 0, 10).subscribe();
      const req = httpMock.expectOne(r => r.url === `${apiUrl}/category/EDUCATION`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('10');
      req.flush({ content: [], page: { size: 10, number: 0, totalElements: 0, totalPages: 0 } });
    });
  });

  // ── getCampaignUpdates ───────────────────────────────────────────────────

  describe('getCampaignUpdates', () => {
    it('should send GET to /api/campaigns/:id/updates', () => {
      service.getCampaignUpdates('camp-1').subscribe();
      const req = httpMock.expectOne(`${apiUrl}/camp-1/updates`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });
});
