import { NextResponse } from 'next/server';
import { fetchLiveComps } from '@/lib/pricing/compsEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, brand, condition, currentValue } = body;

    if (!title) {
      return NextResponse.json({ error: 'Item title is required for comps search' }, { status: 400 });
    }

    const compsData = await fetchLiveComps({
      itemTitle: title,
      category,
      brand,
      condition,
      currentValue: Number(currentValue) || undefined
    });

    return NextResponse.json({ success: true, data: compsData });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch comps data';
    console.error('Error fetching comps data:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
