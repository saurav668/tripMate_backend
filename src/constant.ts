export enum TripPartnerStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}
export enum NotificationType {
  TRIP_REQUEST = 'TRIP_REQUEST',
  REQUEST_ACCEPTED = 'REQUEST_ACCEPTED',
  REQUEST_REJECTED = 'REQUEST_REJECTED',
}

export enum TripMemberRole {
  OWNER = 'OWNER',
  MEMBER = 'MEMBER',
}

export enum TripMemberStatus {
  ACTIVE = 'ACTIVE',
  LEFT = 'LEFT',
  REMOVED = 'REMOVED',
}