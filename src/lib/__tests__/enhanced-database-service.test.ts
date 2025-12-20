/**
 * Test Suite for Enhanced Database Service
 * Tests API response handling, data unwrapping, and fallback behavior
 */

import { EnhancedDatabaseService } from '../enhanced-database-service';

// Mock fetch for testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
});

describe('EnhancedDatabaseService', () => {
  let service: EnhancedDatabaseService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EnhancedDatabaseService({
      fallbackToLocalStorage: false, // Disable for pure API testing
      useApiRoutes: true
    });
  });

  describe('API Response Handling', () => {
    it('should unwrap wrapped API responses correctly', async () => {
      const wrappedResponse = {
        success: true,
        data: {
          phone: "+63-9XX-XXX-XXXX",
          email: "test@cozycondo.net",
          address: "Iloilo City, Philippines",
          heroTitle: "Test Title"
        },
        message: "Retrieved 31 settings"
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(wrappedResponse)
      });

      const result = await service.getWebsiteSettings();

      expect(result).toEqual(wrappedResponse.data);
      expect(result.phone).toBe("+63-9XX-XXX-XXXX");
      expect(result.email).toBe("test@cozycondo.net");
      expect(result).not.toHaveProperty('success');
      expect(result).not.toHaveProperty('message');
    });

    it('should handle direct API responses (non-wrapped)', async () => {
      const directResponse = {
        phone: "+63-9XX-XXX-XXXX",
        email: "test@cozycondo.net",
        heroTitle: "Direct Response Title"
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(directResponse)
      });

      const result = await service.getWebsiteSettings();

      expect(result).toEqual(directResponse);
      expect(result.phone).toBe("+63-9XX-XXX-XXXX");
    });

    it('should handle malformed wrapped responses', async () => {
      const malformedResponse = {
        success: true,
        // Missing 'data' property
        message: "Retrieved settings"
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(malformedResponse)
      });

      const result = await service.getWebsiteSettings();

      // Should return the original response if unwrapping fails
      expect(result).toEqual(malformedResponse);
    });

    it('should handle null/undefined responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null)
      });

      const result = await service.getWebsiteSettings();
      expect(result).toBeNull();
    });

    it('should handle responses with success: false', async () => {
      const errorResponse = {
        success: false,
        data: null,
        message: "Error occurred"
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(errorResponse)
      });

      const result = await service.getWebsiteSettings();

      // Should still unwrap since we check for 'success' property existence, not value
      expect(result).toBeNull();
    });

    it('should handle HTTP errors correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(service.getWebsiteSettings()).rejects.toThrow('API call failed: 404 Not Found');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(service.getWebsiteSettings()).rejects.toThrow('Network error');
    });
  });

  describe('Data Structure Validation', () => {
    it('should preserve all expected fields from API response', async () => {
      const fullResponse = {
        success: true,
        data: {
          logo: "",
          footerLogo: "",
          heroBackground: "",
          aboutImage: "",
          contactImage: "",
          favicon: "",
          heroBadgeText: "Premium Rentals",
          heroTitle: "Cozy Escape",
          heroSubtitle: "Comfort & Convenience",
          heroDescription: "Perfect blend of comfort",
          statsUnits: "12+",
          statsUnitsLabel: "Premium Units",
          statsRating: "4.9",
          statsRatingLabel: "Guest Rating",
          statsLocation: "Iloilo",
          statsLocationLabel: "City Center",
          highlyRatedTitle: "Highly Rated",
          highlyRatedSubtitle: "by guests",
          highlyRatedImage: "",
          featuredTitle: "Featured Properties",
          featuredSubtitle: "Handpicked condos",
          phone: "+63-917-123-4567",
          email: "info@cozycondo.com",
          address: "123 Main St",
          website: "https://cozycondo.com",
          facebookUrl: "https://facebook.com/cozycondo",
          messengerUrl: "https://m.me/cozycondo",
          checkinTime: "15:00",
          checkoutTime: "11:00",
          timezone: "Asia/Manila",
          currency: "PHP",
          updatedAt: "2025-12-20T05:40:30.766Z"
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(fullResponse)
      });

      const result = await service.getWebsiteSettings();

      // Verify all fields are preserved
      expect(result).toEqual(fullResponse.data);

      // Check specific critical fields that were blank in the original issue
      expect(result.phone).toBe("+63-917-123-4567");
      expect(result.email).toBe("info@cozycondo.com");
      expect(result.address).toBe("123 Main St");
      expect(result.checkinTime).toBe("15:00");
      expect(result.checkoutTime).toBe("11:00");
      expect(result.timezone).toBe("Asia/Manila");
      expect(result.currency).toBe("PHP");
      expect(result.heroTitle).toBe("Cozy Escape");
    });

    it('should handle empty string values correctly', async () => {
      const responseWithEmpties = {
        success: true,
        data: {
          logo: "",
          phone: "",
          email: "",
          heroTitle: "Non-empty title",
          heroBadgeText: ""
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(responseWithEmpties)
      });

      const result = await service.getWebsiteSettings();

      expect(result.logo).toBe("");
      expect(result.phone).toBe("");
      expect(result.email).toBe("");
      expect(result.heroTitle).toBe("Non-empty title");
      expect(result.heroBadgeText).toBe("");
    });

    it('should handle missing optional fields', async () => {
      const partialResponse = {
        success: true,
        data: {
          heroTitle: "Title Only",
          phone: "+63-123-456-7890"
          // Missing many other fields
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(partialResponse)
      });

      const result = await service.getWebsiteSettings();

      expect(result.heroTitle).toBe("Title Only");
      expect(result.phone).toBe("+63-123-456-7890");
      expect(result.email).toBeUndefined(); // Missing fields should be undefined
    });
  });

  describe('Edge Cases', () => {
    it('should handle responses where data is not an object', async () => {
      const stringDataResponse = {
        success: true,
        data: "string data",
        message: "Unexpected format"
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(stringDataResponse)
      });

      const result = await service.getWebsiteSettings();

      expect(result).toBe("string data");
    });

    it('should handle responses where success and data are nested differently', async () => {
      const weirdResponse = {
        result: {
          success: true,
          data: {
            phone: "nested data"
          }
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(weirdResponse)
      });

      const result = await service.getWebsiteSettings();

      // Should not unwrap since success/data are not at root level
      expect(result).toEqual(weirdResponse);
    });

    it('should handle circular reference data', async () => {
      const circularData: any = {
        phone: "+63-123"
      };
      circularData.self = circularData; // Create circular reference

      const circularResponse = {
        success: true,
        data: circularData
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(circularResponse)
      });

      const result = await service.getWebsiteSettings();

      expect(result.phone).toBe("+63-123");
      expect(result.self).toBe(result); // Circular reference preserved
    });
  });

  describe('Type Safety', () => {
    it('should maintain TypeScript type safety after unwrapping', async () => {
      const typedResponse = {
        success: true,
        data: {
          phone: "+63-123-456-7890",
          email: "test@example.com",
          heroTitle: "Test Title",
          checkinTime: "15:00",
          timezone: "Asia/Manila"
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(typedResponse)
      });

      const result = await service.getWebsiteSettings();

      // These should all be properly typed as strings
      const phone: string = result.phone || "";
      const email: string = result.email || "";
      const heroTitle: string = result.heroTitle || "";

      expect(typeof phone).toBe("string");
      expect(typeof email).toBe("string");
      expect(typeof heroTitle).toBe("string");
    });
  });
});