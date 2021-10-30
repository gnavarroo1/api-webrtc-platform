export type TKind = 'video' | 'audio';
export type MediaCapabilities = {
  _connectionType: string;
  _isScreenSharing: boolean;
  _canScreenShare: boolean;
  _produceAudioAllowed: boolean;
  _produceVideoAllowed: boolean;
  _produceAudioEnabled: boolean;
  _produceVideoEnabled: boolean;
};
export type SfuProducerStats = {
  bitrate: number;
  byteCount: number;
  firCount: number;
  kind: TKind;
  jitter: number;
  pliCount: number;
  packetsLost: number;
};
export type P2POutboundStats = {
  bitrate: number;
  byteCount: number;
  firCount?: number;
  kind: TKind;
  jitter?: number;
  pliCount?: number;
  packetsLost: number;
};
