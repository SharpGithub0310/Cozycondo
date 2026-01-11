import { NextRequest } from 'next/server';
import { createAdminClient, rateLimit } from '@/lib/api-auth';
import {
  successResponse,
  errorResponse,
  handleDatabaseError,
} from '@/lib/api-utils';

// =============================================
// TypeScript Interfaces
// =============================================

export interface RevenueStats {
  totalRevenue: number;
  bookingCount: number;
  totalNights: number;
  avgNightlyRate: number;
  occupancyRate: number;
}

export interface MonthlyRevenue {
  monthNumber: number;
  monthName: string;
  revenue: number;
  bookingCount: number;
}

export interface PropertyRevenue {
  propertyId: string;
  propertyName: string;
  revenue: number;
  bookingCount: number;
  totalNights: number;
  occupancyRate: number;
}

export interface RevenueResponse {
  period: {
    startDate: string;
    endDate: string;
    label: string;
  };
  stats: RevenueStats;
  monthlyTrend: MonthlyRevenue[];
  propertyBreakdown: PropertyRevenue[];
}

// =============================================
// Helper Functions
// =============================================

function getDateRange(period: string, startDate?: string, endDate?: string): {
  start: Date;
  end: Date;
  label: string;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'month': {
      // Current month
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start, end, label: 'This Month' };
    }
    case 'last_month': {
      // Last month
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start, end, label: 'Last Month' };
    }
    case 'quarter': {
      // Current quarter
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), currentQuarter * 3, 1);
      const end = new Date(now.getFullYear(), currentQuarter * 3 + 3, 0);
      return { start, end, label: 'This Quarter' };
    }
    case 'year': {
      // Current year
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return { start, end, label: 'This Year' };
    }
    case 'custom': {
      // Custom date range
      if (!startDate || !endDate) {
        throw new Error('Custom period requires startDate and endDate');
      }
      return {
        start: new Date(startDate),
        end: new Date(endDate),
        label: 'Custom Period'
      };
    }
    default:
      // Default to current month
      const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: defaultStart, end: defaultEnd, label: 'This Month' };
  }
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// =============================================
// GET /api/revenue - Revenue statistics (admin only)
// =============================================

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request, 60, 15 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return errorResponse(
        'Rate limit exceeded. Please try again later.',
        429,
        { resetTime: new Date(rateLimitResult.resetTime).toISOString() }
      );
    }

    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    const sessionToken = request.headers.get('x-admin-session');
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'cozy2024';

    const isAdmin = (authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1] === validPassword)
      || sessionToken === 'authenticated';

    if (!isAdmin) {
      return errorResponse('Admin authentication required', 401);
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return errorResponse('Database not configured', 503);
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const propertyId = searchParams.get('propertyId') || null;
    const customStartDate = searchParams.get('startDate') || undefined;
    const customEndDate = searchParams.get('endDate') || undefined;

    // Get date range for the period
    let dateRange;
    try {
      dateRange = getDateRange(period, customStartDate, customEndDate);
    } catch (error: any) {
      return errorResponse(error.message, 400);
    }

    const startDateStr = formatDate(dateRange.start);
    const endDateStr = formatDate(dateRange.end);

    // Fetch revenue statistics using the database function
    const { data: statsData, error: statsError } = await adminClient
      .rpc('get_revenue_stats', {
        p_start_date: startDateStr,
        p_end_date: endDateStr,
        p_property_id: propertyId || null
      });

    if (statsError) {
      console.error('Error fetching revenue stats:', statsError);
      // Fall back to manual calculation if function doesn't exist
      return await fallbackRevenueCalculation(adminClient, startDateStr, endDateStr, propertyId, dateRange);
    }

    // Fetch monthly trend for the current year
    const currentYear = new Date().getFullYear();
    const { data: trendData, error: trendError } = await adminClient
      .rpc('get_monthly_revenue_trend', {
        p_year: currentYear,
        p_property_id: propertyId || null
      });

    let monthlyTrend: MonthlyRevenue[] = [];
    if (!trendError && trendData) {
      monthlyTrend = trendData.map((row: any) => ({
        monthNumber: row.month_number,
        monthName: row.month_name,
        revenue: parseFloat(row.revenue) || 0,
        bookingCount: parseInt(row.booking_count) || 0
      }));
    }

    // Fetch property breakdown (only if not filtering by specific property)
    let propertyBreakdown: PropertyRevenue[] = [];
    if (!propertyId) {
      const { data: breakdownData, error: breakdownError } = await adminClient
        .rpc('get_property_revenue_breakdown', {
          p_start_date: startDateStr,
          p_end_date: endDateStr
        });

      if (!breakdownError && breakdownData) {
        propertyBreakdown = breakdownData.map((row: any) => ({
          propertyId: row.property_id,
          propertyName: row.property_name,
          revenue: parseFloat(row.revenue) || 0,
          bookingCount: parseInt(row.booking_count) || 0,
          totalNights: parseInt(row.total_nights) || 0,
          occupancyRate: parseFloat(row.occupancy_rate) || 0
        }));
      }
    }

    // Format the stats response
    const stats: RevenueStats = statsData && statsData[0] ? {
      totalRevenue: parseFloat(statsData[0].total_revenue) || 0,
      bookingCount: parseInt(statsData[0].booking_count) || 0,
      totalNights: parseInt(statsData[0].total_nights) || 0,
      avgNightlyRate: parseFloat(statsData[0].avg_nightly_rate) || 0,
      occupancyRate: parseFloat(statsData[0].occupancy_rate) || 0
    } : {
      totalRevenue: 0,
      bookingCount: 0,
      totalNights: 0,
      avgNightlyRate: 0,
      occupancyRate: 0
    };

    const response: RevenueResponse = {
      period: {
        startDate: startDateStr,
        endDate: endDateStr,
        label: dateRange.label
      },
      stats,
      monthlyTrend,
      propertyBreakdown
    };

    return successResponse(response, 'Revenue statistics retrieved successfully');

  } catch (error) {
    console.error('Revenue GET error:', error);
    return errorResponse('Failed to retrieve revenue statistics', 500);
  }
}

// Fallback calculation if SQL functions are not available
async function fallbackRevenueCalculation(
  adminClient: any,
  startDate: string,
  endDate: string,
  propertyId: string | null,
  dateRange: { start: Date; end: Date; label: string }
) {
  try {
    // Build query for bookings in the date range
    let query = adminClient
      .from('bookings')
      .select(`
        id,
        total_amount,
        num_nights,
        nightly_rate,
        property_id,
        properties:property_id (name)
      `)
      .in('status', ['paid', 'confirmed', 'checked_in', 'checked_out'])
      .gte('check_in', startDate)
      .lte('check_out', endDate);

    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    const { data: bookings, error } = await query;

    if (error) {
      return handleDatabaseError(error);
    }

    // Calculate stats from bookings
    const totalRevenue = bookings?.reduce((sum: number, b: any) => sum + (parseFloat(b.total_amount) || 0), 0) || 0;
    const bookingCount = bookings?.length || 0;
    const totalNights = bookings?.reduce((sum: number, b: any) => sum + (parseInt(b.num_nights) || 0), 0) || 0;
    const avgNightlyRate = totalNights > 0 ? totalRevenue / totalNights : 0;

    // Calculate occupancy rate
    const daysInPeriod = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const { data: propertyCount } = await adminClient
      .from('properties')
      .select('id', { count: 'exact' })
      .eq('active', true);

    const totalAvailableNights = daysInPeriod * (propertyCount?.length || 1);
    const occupancyRate = totalAvailableNights > 0 ? (totalNights / totalAvailableNights) * 100 : 0;

    // Group by property for breakdown
    const propertyMap = new Map<string, PropertyRevenue>();
    bookings?.forEach((b: any) => {
      const pid = b.property_id;
      const existing = propertyMap.get(pid);
      if (existing) {
        existing.revenue += parseFloat(b.total_amount) || 0;
        existing.bookingCount += 1;
        existing.totalNights += parseInt(b.num_nights) || 0;
      } else {
        propertyMap.set(pid, {
          propertyId: pid,
          propertyName: b.properties?.name || 'Unknown',
          revenue: parseFloat(b.total_amount) || 0,
          bookingCount: 1,
          totalNights: parseInt(b.num_nights) || 0,
          occupancyRate: 0
        });
      }
    });

    // Calculate occupancy rate per property
    propertyMap.forEach((prop) => {
      prop.occupancyRate = (prop.totalNights / daysInPeriod) * 100;
    });

    const propertyBreakdown = Array.from(propertyMap.values())
      .sort((a, b) => b.revenue - a.revenue);

    // Generate monthly trend for current year
    const currentYear = new Date().getFullYear();
    const monthlyTrend: MonthlyRevenue[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let month = 1; month <= 12; month++) {
      const monthBookings = bookings?.filter((b: any) => {
        const checkIn = new Date(b.check_in);
        return checkIn.getMonth() + 1 === month && checkIn.getFullYear() === currentYear;
      }) || [];

      monthlyTrend.push({
        monthNumber: month,
        monthName: monthNames[month - 1],
        revenue: monthBookings.reduce((sum: number, b: any) => sum + (parseFloat(b.total_amount) || 0), 0),
        bookingCount: monthBookings.length
      });
    }

    const response: RevenueResponse = {
      period: {
        startDate,
        endDate,
        label: dateRange.label
      },
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        bookingCount,
        totalNights,
        avgNightlyRate: Math.round(avgNightlyRate * 100) / 100,
        occupancyRate: Math.round(occupancyRate * 100) / 100
      },
      monthlyTrend,
      propertyBreakdown: propertyId ? [] : propertyBreakdown
    };

    return successResponse(response, 'Revenue statistics retrieved successfully (fallback calculation)');

  } catch (error) {
    console.error('Fallback revenue calculation error:', error);
    return errorResponse('Failed to calculate revenue statistics', 500);
  }
}
