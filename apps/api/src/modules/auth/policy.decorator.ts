import {SetMetadata} from '@nestjs/common';
export const POLICY_KEY = 'policy';
export const Policy = (permission: string) => SetMetadata(POLICY_KEY, permission);


