export interface JwtPayload {
  username?: string;
  sub?: string;
  sessionId: string;
  isGuest: boolean;
}
