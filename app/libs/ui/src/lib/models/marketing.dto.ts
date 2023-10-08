export interface OptInResult {
  optIn: boolean;
  reasons: OptInFailureReasons[];
}

export enum OptInFailureReasons {
  IS_ALREADY_OPTED_IN = 'IS_ALREADY_OPTED_IN',
}

export enum OptInType {
  CouponCodes = 'CouponCodes',
}
