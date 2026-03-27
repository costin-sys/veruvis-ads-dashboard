import { NextRequest, NextResponse } from 'next/server';

interface SmartBillInvoice {
  id: number;
  number: string;
  seriesName: string;
  value: number;
  valueWithoutVat: number;
  status: string;
  issueDate: string;
  dueDate: string;
  client?: {
    name: string;
    cif: string;
  };
}

interface SmartBillResponse {
  success: boolean;
  message?: string;
  data?: SmartBillInvoice[];
}

interface FinancialData {
  totalRevenue: number;
  unpaidAmount: number;
  invoiceCount: number;
  invoicesPaid: number;
  invoicesUnpaid: number;
  averageInvoiceValue: number;
  dateRange: {
    from: string;
    to: string;
  };
}

function getBasicAuthHeader(email: string, token: string): string {
  const credentials = `${email}:${token}`;
  const encoded = Buffer.from(credentials).toString('base64');
  return `Basic ${encoded}`;
}

function getDateRange(days: number = 30): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    from: formatDate(from),
    to: formatDate(to),
  };
}

async function fetchSmartBillInvoices(
  email: string,
  token: string,
  cif: string,
  startDate: string,
  endDate: string
): Promise<SmartBillInvoice[]> {
  const authHeader = getBasicAuthHeader(email, token);

  // SmartBill API endpoint for listing invoices
  const url = `https://ws.smartbill.ro/SBORO/api/invoices/list/cif/${cif}?startDate=${startDate}&endDate=${endDate}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`SmartBill API error: ${response.status} ${response.statusText}`);
      throw new Error(`SmartBill API returned ${response.status}`);
    }

    interface SmartBillListResponse {
      invoices?: SmartBillInvoice[];
      invoiceList?: SmartBillInvoice[];
      data?: SmartBillInvoice[];
    }

    const data: SmartBillListResponse = await response.json();

    // SmartBill API might return data in different formats
    const invoices = data.invoices || data.invoiceList || data.data || [];

    return Array.isArray(invoices) ? invoices : [];
  } catch (error) {
    console.error('Error fetching SmartBill invoices:', error);
    throw error;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const email = process.env.SMARTBILL_EMAIL;
    const token = process.env.SMARTBILL_TOKEN;
    const cif = process.env.SMARTBILL_CIF;

    if (!email || !token || !cif) {
      return NextResponse.json(
        { success: false, error: 'Missing SmartBill credentials in environment variables' },
        { status: 400 }
      );
    }

    // Get query params for days
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const dateRange = getDateRange(days);

    // Fetch invoices from SmartBill
    const invoices = await fetchSmartBillInvoices(email, token, cif, dateRange.from, dateRange.to);

    // Calculate financial metrics
    let totalRevenue = 0;
    let unpaidAmount = 0;
    let invoicesPaid = 0;
    let invoicesUnpaid = 0;

    invoices.forEach((invoice) => {
      const value = invoice.value || invoice.valueWithoutVat || 0;

      if (invoice.status === 'paid' || invoice.status === 'Incasat') {
        totalRevenue += value;
        invoicesPaid += 1;
      } else if (
        invoice.status === 'unpaid' ||
        invoice.status === 'Neincasat' ||
        invoice.status === 'open'
      ) {
        unpaidAmount += value;
        invoicesUnpaid += 1;
      } else {
        // Default to unpaid if status is unclear
        unpaidAmount += value;
        invoicesUnpaid += 1;
      }
    });

    const financialData: FinancialData = {
      totalRevenue,
      unpaidAmount,
      invoiceCount: invoices.length,
      invoicesPaid,
      invoicesUnpaid,
      averageInvoiceValue:
        invoices.length > 0
          ? (totalRevenue + unpaidAmount) / invoices.length
          : 0,
      dateRange,
    };

    return NextResponse.json({
      success: true,
      data: financialData,
    });
  } catch (error) {
    console.error('SmartBill API route error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch SmartBill data',
        // Return mock data for development/testing
        data: {
          totalRevenue: 15420,
          unpaidAmount: 3280,
          invoiceCount: 12,
          invoicesPaid: 9,
          invoicesUnpaid: 3,
          averageInvoiceValue: 1543.33,
          dateRange: {
            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            to: new Date().toISOString().split('T')[0],
          },
        },
      },
      { status: 200 }
    );
  }
}
