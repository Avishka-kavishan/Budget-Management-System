import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { canUserViewWorkshop } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user as any;
  const data = db.read();

  // Permitted workshops for this user
  const userWorkshops = data.workshops.filter((w) => canUserViewWorkshop(user, w));

  const totalWorkshops = userWorkshops.length;
  const totalExpectedTrainees = userWorkshops.reduce((sum, w) => sum + (w.expectedTrainees || 0), 0);
  const totalActualTrainees = userWorkshops.reduce((sum, w) => sum + (w.actualTrainees || 0), 0);

  // Status breakdown
  const statusCounts: Record<string, { name: string; color: string; count: number }> = {};
  data.workshopStatuses.forEach((s) => {
    statusCounts[s.id] = { name: s.name, color: s.color, count: 0 };
  });
  userWorkshops.forEach((w) => {
    const key = w.statusId || (w.status ? `status-${w.status.toLowerCase().replace(/\s+/g, '-')}` : 'status-scheduled');
    if (statusCounts[key]) {
      statusCounts[key].count += 1;
    } else if (statusCounts['status-scheduled']) {
      statusCounts['status-scheduled'].count += 1;
    }
  });

  // Category (Subject) breakdown
  const categoryCounts: Record<string, { name: string; count: number }> = {};
  userWorkshops.forEach((w) => {
    const catName =
      w.subject ||
      w.categoryName ||
      (w.categoryId ? data.workshopCategories.find((c) => c.id === w.categoryId)?.name : null) ||
      'General';
    if (!categoryCounts[catName]) {
      categoryCounts[catName] = { name: catName, count: 0 };
    }
    categoryCounts[catName].count += 1;
  });

  // Target Org breakdown
  const targetOrgCounts: Record<string, { name: string; count: number; trainees: number }> = {};
  userWorkshops.forEach((w) => {
    const org = data.organizations.find((o) => o.id === (w.targetOrgId || w.placeId));
    const orgName = w.placeName || org?.name || 'Unassigned';
    if (!targetOrgCounts[orgName]) {
      targetOrgCounts[orgName] = { name: orgName, count: 0, trainees: 0 };
    }
    targetOrgCounts[orgName].count += 1;
    targetOrgCounts[orgName].trainees += w.expectedTrainees || 0;
  });

  return NextResponse.json({
    metrics: {
      totalWorkshops,
      totalExpectedTrainees,
      totalActualTrainees,
      activeWorkshops: userWorkshops.filter((w) =>
        ['status-approved', 'status-ongoing', 'status-scheduled'].includes(w.statusId || '')
      ).length,
      pendingApproval: userWorkshops.filter((w) =>
        ['status-submitted', 'status-under-review'].includes(w.statusId || '')
      ).length,
      completedWorkshops: userWorkshops.filter(
        (w) => w.statusId === 'status-completed' || w.status === 'Completed'
      ).length,
    },
    statusBreakdown: Object.values(statusCounts),
    categoryBreakdown: Object.values(categoryCounts).filter((c) => c.count > 0),
    targetOrgBreakdown: Object.values(targetOrgCounts),
  });
}
