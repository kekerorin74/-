import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

export async function GET() {
    try {
        // Fetch more for admin list, homepage uses direct DB call with LIMIT 6
        const { rows } = await db.query('SELECT * FROM predictions ORDER BY id DESC LIMIT 50');
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const session = cookieStore.get('antigravity_session');

    if (!session || session.value !== 'true') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const {
            race_date, race_name, firm_horse, firm_horse_result,
            value_horse_1, value_horse_1_result,
            value_horse_2, value_horse_2_result,
            value_horse_3, value_horse_3_result
        } = body;

        await db.sql`
          INSERT INTO predictions (
            race_date, race_name, firm_horse, firm_horse_result,
            value_horse_1, value_horse_1_result,
            value_horse_2, value_horse_2_result,
            value_horse_3, value_horse_3_result
          )
          VALUES (
            ${race_date}, ${race_name}, ${firm_horse}, ${firm_horse_result || null},
            ${value_horse_1 || null}, ${value_horse_1_result || null},
            ${value_horse_2 || null}, ${value_horse_2_result || null},
            ${value_horse_3 || null}, ${value_horse_3_result || null}
          )
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to save prediction' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const cookieStore = await cookies();
    const session = cookieStore.get('antigravity_session');

    if (!session || session.value !== 'true') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await request.json();
        await db.sql`DELETE FROM predictions WHERE id = ${id}`;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to delete prediction' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const cookieStore = await cookies();
    const session = cookieStore.get('antigravity_session');

    if (!session || session.value !== 'true') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const {
            id, race_date, race_name, firm_horse, firm_horse_result,
            value_horse_1, value_horse_1_result,
            value_horse_2, value_horse_2_result,
            value_horse_3, value_horse_3_result
        } = body;

        await db.sql`
          UPDATE predictions 
          SET 
            race_date = ${race_date}, 
            race_name = ${race_name}, 
            firm_horse = ${firm_horse}, 
            firm_horse_result = ${firm_horse_result || null},
            value_horse_1 = ${value_horse_1}, 
            value_horse_1_result = ${value_horse_1_result || null}, 
            value_horse_2 = ${value_horse_2}, 
            value_horse_2_result = ${value_horse_2_result || null}, 
            value_horse_3 = ${value_horse_3},
            value_horse_3_result = ${value_horse_3_result || null}
          WHERE id = ${id}
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to update prediction' }, { status: 500 });
    }
}
