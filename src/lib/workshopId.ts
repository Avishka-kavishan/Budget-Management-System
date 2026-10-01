/**
 * Helper to generate unique workshop IDs following the hierarchical structure:
 * - MOE: MOE/branch/date/number (e.g. MOE/ICT/20260928/0004)
 * - Province: Province name/branch/date/number (e.g. SOUTHERN/IT/20260928/0004)
 * - Zone: Zone name/branch/date/number (e.g. GALLE/IT/20260928/0004)
 * - NIE: NIE/branch/date/number (e.g. NIE/MAIN/20260928/0004)
 */

export interface ParsedOrgComponents {
  authority: string;
  branch: string;
}

export function parseOrgBranchComponents(rawName: string): ParsedOrgComponents {
  if (!rawName) return { authority: 'MOE', branch: 'GENERAL' };

  const clean = rawName.trim();
  const upper = clean.toUpperCase();

  // 1. NIE (National Institute of Education)
  if (upper.includes('NATIONAL INSTITUTE OF EDUCATION') || upper.startsWith('NIE')) {
    const rawBranch = upper
      .replace(/NATIONAL INSTITUTE OF EDUCATION/gi, '')
      .replace(/\bNIE\b/gi, '')
      .replace(/[-–]/g, ' ')
      .replace(/BRANCH/gi, '')
      .replace(/DEPARTMENT/gi, '')
      .replace(/DIVISION/gi, '')
      .trim();
    const parts = rawBranch.split(/[^A-Z0-9]+/).filter(Boolean);
    return {
      authority: 'NIE',
      branch: parts.length > 0 ? parts.join('-') : 'MAIN',
    };
  }

  // 2. Zone (e.g., "Galle Zone IT Branch", "Colombo Zone IT Branch", "Galle Zonal Education Office")
  const zoneMatch = upper.match(/([A-Z0-9\s]+?)\s+(?:ZONE|ZONAL)\b(.*)/i);
  if (zoneMatch) {
    const zoneNameRaw = zoneMatch[1]
      .replace(/EDUCATION OFFICE/gi, '')
      .replace(/OFFICE/gi, '')
      .trim();
    const zoneParts = zoneNameRaw.split(/[^A-Z0-9]+/).filter(Boolean);
    const authority = zoneParts.length > 0 ? zoneParts.join('-') : 'ZONE';

    const branchRaw = zoneMatch[2]
      .replace(/EDUCATION OFFICE/gi, '')
      .replace(/OFFICE/gi, '')
      .replace(/BRANCH/gi, '')
      .replace(/DIVISION/gi, '')
      .replace(/DEPARTMENT/gi, '')
      .replace(/[-–]/g, ' ')
      .trim();
    const branchParts = branchRaw.split(/[^A-Z0-9]+/).filter(Boolean);
    const branch = branchParts.length > 0 ? branchParts.join('-') : 'OFFICE';

    return { authority, branch };
  }

  // 3. Province (e.g., "Southern Province IT Branch", "Western Province Education Department")
  const provMatch = upper.match(/([A-Z0-9\s]+?)\s+(?:PROVINCE|PROVINCIAL)\b(.*)/i);
  if (provMatch) {
    const provNameRaw = provMatch[1]
      .replace(/EDUCATION DEPARTMENT/gi, '')
      .replace(/DEPARTMENT/gi, '')
      .trim();
    const provParts = provNameRaw.split(/[^A-Z0-9]+/).filter(Boolean);
    const authority = provParts.length > 0 ? provParts.join('-') : 'PROV';

    const branchRaw = provMatch[2]
      .replace(/EDUCATION DEPARTMENT/gi, '')
      .replace(/DEPARTMENT/gi, '')
      .replace(/BRANCH/gi, '')
      .replace(/DIVISION/gi, '')
      .replace(/OFFICE/gi, '')
      .replace(/[-–]/g, ' ')
      .trim();
    const branchParts = branchRaw.split(/[^A-Z0-9]+/).filter(Boolean);
    const branch = branchParts.length > 0 ? branchParts.join('-') : 'DEPT';

    return { authority, branch };
  }

  // 4. MOE / Ministry of Education (e.g., "MOE Data Management Branch", "MOE ICT Branch", "Ministry of Education")
  if (upper.startsWith('MOE') || upper.includes('MINISTRY OF EDUCATION')) {
    const rawBranch = upper
      .replace(/MINISTRY OF EDUCATION/gi, '')
      .replace(/\bMOE\b/gi, '')
      .replace(/[-–]/g, ' ')
      .replace(/BRANCH/gi, '')
      .replace(/DEPARTMENT/gi, '')
      .replace(/DIVISION/gi, '')
      .trim();
    const parts = rawBranch.split(/[^A-Z0-9]+/).filter(Boolean);
    return {
      authority: 'MOE',
      branch: parts.length > 0 ? parts.join('-') : 'HQ',
    };
  }

  // Fallback for custom or direct inputs
  const allParts = upper.split(/[^A-Z0-9]+/).filter(Boolean);
  if (allParts.length >= 2) {
    return {
      authority: allParts[0],
      branch: allParts.slice(1).join('-'),
    };
  }

  return {
    authority: allParts[0] || 'MOE',
    branch: 'MAIN',
  };
}

export function formatWorkshopId(
  branchName: string,
  startDate?: string,
  seqNumber: number | string = 1
): string {
  const { authority, branch } = parseOrgBranchComponents(branchName);

  // Clean date YYYYMMDD
  const dateCode = startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate)
    ? startDate.replace(/-/g, '')
    : new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const seqStr = String(seqNumber).padStart(4, '0');

  return `${authority}/${branch}/${dateCode}/${seqStr}`;
}

/**
 * Returns the next unique sequence number specifically for this branch/authority.
 * If the branch has never organized a workshop before, returns 1.
 */
export function getNextSequenceForBranch(
  branchName: string,
  existingWorkshops: Array<{ workshopNumber?: string; branch?: string }> | string[] = []
): number {
  const { authority, branch } = parseOrgBranchComponents(branchName);
  const targetPrefix = `${authority}/${branch}/`.toUpperCase();

  const numbers: number[] = [];

  for (const item of existingWorkshops) {
    const wsNum = typeof item === 'string' ? item : item?.workshopNumber;
    if (!wsNum) continue;

    const upperWsNum = wsNum.toUpperCase().trim();
    if (upperWsNum.startsWith(targetPrefix)) {
      const parts = upperWsNum.split('/');
      if (parts.length >= 4) {
        const lastPart = parseInt(parts[3], 10);
        if (!isNaN(lastPart)) {
          numbers.push(lastPart);
        }
      }
    }
  }

  if (numbers.length === 0) {
    return 1;
  }

  return Math.max(...numbers) + 1;
}

