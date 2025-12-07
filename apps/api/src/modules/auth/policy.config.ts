export type PolicyMatrix = Record<string, Array<string>>;

const DEFAULT_MATRIX: PolicyMatrix = {
  'audit:read': ['ADMIN'],
  'credentials:verify': ['ADMIN'],
  'institutions:verify': ['ADMIN', 'INSTITUTION_ADMIN'],
  'memberships:manage': ['ADMIN', 'INSTITUTION_ADMIN']
};

let overrideMatrix: PolicyMatrix | undefined;

export function getPolicyMatrix(): PolicyMatrix {
  if (overrideMatrix) return {...DEFAULT_MATRIX, ...overrideMatrix};
  try {
    const raw = process.env.POLICY_MATRIX;
    if (!raw) return DEFAULT_MATRIX;
    const parsed = JSON.parse(raw) as PolicyMatrix;
    // shallow merge: env overrides defaults
    return {...DEFAULT_MATRIX, ...parsed};
  } catch {
    return DEFAULT_MATRIX;
  }
}

export function setPolicyMatrix(matrix: PolicyMatrix | undefined) {
  overrideMatrix = matrix;
}


