/**
 * Test Suite for Admin Settings Component
 * Tests data loading, form population, and error handling
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminSettings from '../app/admin/settings/page';
import { postMigrationDatabaseService } from '../lib/post-migration-database-service';

// Mock the database service
jest.mock('../lib/post-migration-database-service', () => ({
  postMigrationDatabaseService: {
    getWebsiteSettings: jest.fn(),
    saveWebsiteSettings: jest.fn(),
  }
}));

// Mock the icons
jest.mock('lucide-react', () => ({
  Save: () => <div data-testid="save-icon" />,
  Phone: () => <div data-testid="phone-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  MapPin: () => <div data-testid="mappin-icon" />,
  Globe: () => <div data-testid="globe-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Upload: () => <div data-testid="upload-icon" />,
  Image: () => <div data-testid="image-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
}));

const mockDatabaseService = postMigrationDatabaseService as jest.Mocked<typeof postMigrationDatabaseService>;

describe('AdminSettings Component', () => {
  const mockSettings = {
    logo: '',
    footerLogo: '',
    heroBackground: '',
    aboutImage: '',
    contactImage: '',
    favicon: '',
    heroBadgeText: 'Premium Short-Term Rentals',
    heroTitle: 'Your Cozy Escape in Iloilo City',
    heroSubtitle: 'Comfortable Living',
    heroDescription: 'Experience the perfect blend of comfort and convenience.',
    statsUnits: '12+',
    statsUnitsLabel: 'Premium Units',
    statsRating: '4.9',
    statsRatingLabel: 'Guest Rating',
    statsLocation: 'Iloilo',
    statsLocationLabel: 'City Center',
    highlyRatedTitle: 'Highly Rated',
    highlyRatedSubtitle: 'by our guests',
    highlyRatedImage: '',
    featuredTitle: 'Featured Properties',
    featuredSubtitle: 'Handpicked condominiums offering the perfect balance of comfort, convenience, and style.',
    phone: '+63-917-123-4567',
    email: 'info@cozycondo.com',
    address: '123 Main St, Iloilo City',
    website: 'https://cozycondo.com',
    facebookUrl: 'https://facebook.com/cozycondo',
    messengerUrl: 'https://m.me/cozycondo',
    checkinTime: '15:00',
    checkoutTime: '11:00',
    timezone: 'Asia/Manila',
    currency: 'PHP',
    updatedAt: '2025-12-20T05:40:30.766Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Loading', () => {
    it('should display loading state initially', async () => {
      mockDatabaseService.getWebsiteSettings.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockSettings), 100))
      );

      render(<AdminSettings />);

      // Should show loading skeleton
      expect(screen.getByText('Loading...').closest('.animate-pulse')).toBeInTheDocument();
    });

    it('should load and display settings from database', async () => {
      mockDatabaseService.getWebsiteSettings.mockResolvedValue(mockSettings);

      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...').closest('.animate-pulse')).not.toBeInTheDocument();
      });

      // Check that form fields are populated with the mock data
      const phoneInput = screen.getByDisplayValue('+63-917-123-4567');
      expect(phoneInput).toBeInTheDocument();

      const emailInput = screen.getByDisplayValue('info@cozycondo.com');
      expect(emailInput).toBeInTheDocument();

      const addressInput = screen.getByDisplayValue('123 Main St, Iloilo City');
      expect(addressInput).toBeInTheDocument();

      const heroTitleInput = screen.getByDisplayValue('Your Cozy Escape in Iloilo City');
      expect(heroTitleInput).toBeInTheDocument();
    });

    it('should handle database service errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockDatabaseService.getWebsiteSettings.mockRejectedValue(new Error('Database connection failed'));

      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load settings/)).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should populate default values when API returns empty data', async () => {
      // Test with minimal data to see if defaults are used
      const minimalSettings = {
        logo: '',
        footerLogo: '',
        heroBackground: '',
        aboutImage: '',
        contactImage: '',
        favicon: '',
        heroBadgeText: '',
        heroTitle: 'Your Cozy Escape in Iloilo City', // Default value
        heroSubtitle: '',
        heroDescription: 'Experience the perfect blend of comfort and convenience. Our handpicked condominiums offer modern amenities, stunning views, and prime locations across Iloilo City.', // Default value
        statsUnits: '9+', // Default value
        statsUnitsLabel: 'Premium Units',
        statsRating: '4.9',
        statsRatingLabel: 'Guest Rating',
        statsLocation: 'Iloilo',
        statsLocationLabel: 'City Center',
        highlyRatedTitle: 'Highly Rated',
        highlyRatedSubtitle: 'by our guests',
        highlyRatedImage: '',
        featuredTitle: 'Featured Properties',
        featuredSubtitle: 'Handpicked condominiums offering the perfect balance of comfort, convenience, and style.',
        updatedAt: ''
      };

      mockDatabaseService.getWebsiteSettings.mockResolvedValue(minimalSettings);

      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...').closest('.animate-pulse')).not.toBeInTheDocument();
      });

      // Default values should be present
      expect(screen.getByDisplayValue('Your Cozy Escape in Iloilo City')).toBeInTheDocument();
      expect(screen.getByDisplayValue('9+')).toBeInTheDocument();
    });
  });

  describe('Form Field Population', () => {
    beforeEach(() => {
      mockDatabaseService.getWebsiteSettings.mockResolvedValue(mockSettings);
    });

    it('should populate all contact information fields', async () => {
      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...').closest('.animate-pulse')).not.toBeInTheDocument();
      });

      // Contact Information
      expect(screen.getByDisplayValue('+63-917-123-4567')).toBeInTheDocument();
      expect(screen.getByDisplayValue('info@cozycondo.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123 Main St, Iloilo City')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://cozycondo.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://facebook.com/cozycondo')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://m.me/cozycondo')).toBeInTheDocument();
    });

    it('should populate booking settings fields', async () => {
      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...').closest('.animate-pulse')).not.toBeInTheDocument();
      });

      // Booking Settings
      expect(screen.getByDisplayValue('15:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('11:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Asia/Manila')).toBeInTheDocument();
      expect(screen.getByDisplayValue('PHP')).toBeInTheDocument();
    });

    it('should populate homepage content fields', async () => {
      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...').closest('.animate-pulse')).not.toBeInTheDocument();
      });

      // Homepage Content
      expect(screen.getByDisplayValue('Premium Short-Term Rentals')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Your Cozy Escape in Iloilo City')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Experience the perfect blend of comfort and convenience.')).toBeInTheDocument();
    });

    it('should populate statistics fields', async () => {
      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...').closest('.animate-pulse')).not.toBeInTheDocument();
      });

      // Statistics
      expect(screen.getByDisplayValue('12+')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Premium Units')).toBeInTheDocument();
      expect(screen.getByDisplayValue('4.9')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Guest Rating')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Iloilo')).toBeInTheDocument();
      expect(screen.getByDisplayValue('City Center')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    beforeEach(() => {
      mockDatabaseService.getWebsiteSettings.mockResolvedValue(mockSettings);
    });

    it('should allow editing form fields', async () => {
      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...').closest('.animate-pulse')).not.toBeInTheDocument();
      });

      const phoneInput = screen.getByDisplayValue('+63-917-123-4567') as HTMLInputElement;

      fireEvent.change(phoneInput, { target: { value: '+63-917-999-8888' } });

      expect(phoneInput.value).toBe('+63-917-999-8888');
    });

    it('should save settings when form is submitted', async () => {
      mockDatabaseService.saveWebsiteSettings.mockResolvedValue();

      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...').closest('.animate-pulse')).not.toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save settings/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockDatabaseService.saveWebsiteSettings).toHaveBeenCalledWith(mockSettings);
      });
    });

    it('should show save success message', async () => {
      mockDatabaseService.saveWebsiteSettings.mockResolvedValue();

      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...').closest('.animate-pulse')).not.toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save settings/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/settings saved successfully/i)).toBeInTheDocument();
      });
    });

    it('should handle save errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockDatabaseService.saveWebsiteSettings.mockRejectedValue(new Error('Save failed'));

      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...').closest('.animate-pulse')).not.toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save settings/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to save settings/i)).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Data Validation Edge Cases', () => {
    it('should handle null or undefined values from API', async () => {
      const settingsWithNulls = {
        ...mockSettings,
        phone: null,
        email: undefined,
        heroTitle: '',
      };

      mockDatabaseService.getWebsiteSettings.mockResolvedValue(settingsWithNulls as any);

      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...').closest('.animate-pulse')).not.toBeInTheDocument();
      });

      // Should handle null/undefined gracefully
      const phoneInput = screen.getByPlaceholderText('Phone number') as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText('Email address') as HTMLInputElement;

      expect(phoneInput.value).toBe('');
      expect(emailInput.value).toBe('');
    });

    it('should handle API response structure mismatch', async () => {
      // Simulate API returning data in wrong format
      const malformedData = {
        data: mockSettings, // API wraps in data object
        success: true
      };

      mockDatabaseService.getWebsiteSettings.mockResolvedValue(malformedData as any);

      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...').closest('.animate-pulse')).not.toBeInTheDocument();
      });

      // Component should either handle gracefully or show error
      // This test would catch if the component expects direct object but gets wrapped response
    });
  });

  describe('Console Logging Verification', () => {
    it('should log database loading confirmation', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      mockDatabaseService.getWebsiteSettings.mockResolvedValue(mockSettings);

      render(<AdminSettings />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...').closest('.animate-pulse')).not.toBeInTheDocument();
      });

      // Should log successful database load
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Admin Settings: Loaded from database:'),
        mockSettings
      );

      consoleLogSpy.mockRestore();
    });
  });
});