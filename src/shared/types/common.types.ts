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

export type P2PVideoStats = {
  bytesSent?: number;
  bytesReceived?: number;
  packetsReceived?: number;
  packetsSent?: number;
  packetsLost?: number;
  nackCountInbound?: number;
  nackCountOutbound?: number;
  framesSent?: number;
  framesEncoded?: number;
  qpSumOutbound?: number;
  firCountOutbound?: number;
  pliCountOutbound?: number;
  framesReceived?: number;
  framesDecoded?: number;
  qpSumInbound?: number;
  firCountInbound?: number;
  pliCountInbound?: number;
  timestamp?: number;
  jitter?: number;
  qualityLimitationReason?: 'none' | 'cpu' | 'bandwidth' | 'other';
};
export type P2PAudioStats = {
  bytesSent?: number;
  bytesReceived?: number;
  packetsReceived?: number;
  packetsSent?: number;
  packetsLost?: number;
  nackCountInbound?: number;
  nackCountOutbound?: number;
  timestamp?: number;
  jitter?: number;
};

export type TransportStats = {
  bytesSent?: number;
  bytesReceived?: number;
  packetsSent?: number;
  packetsReceived?: number;
  timestamp?: number;
};

export type P2PStatsSnapshot = {
  transport?: TransportStats;
  video?: P2PVideoStats;
  audio?: P2PAudioStats;
};

export type VideoProducerStats = {
  bitrate?: number;
  nackCount: number;
  firCount?: number;
  pliCount?: number;
  jitter?: number;
  byteCount?: number;
  packetCount?: number;
  packetsLost?: number;
  timestamp: number;
};
export type AudioProducerStats = {
  bitrate?: number;
  nackCount?: number;
  packetCount?: number;
  packetsLost?: number;
  jitter?: number;
  byteCount?: number;
  timestamp: number;
};

export type ProducerStatsSnapshot = {
  transport?: TransportStats;
  video?: VideoProducerStats;
  audio?: AudioProducerStats;
};

export type VideoConsumerStats = {
  transport?: TransportStats;
  bytesReceived?: number;
  packetsReceived?: number;
  framesReceived?: number;
  framesDecoded?: number;
  packetsLost?: number;
  nackCountInbound?: number;
  qpSumInbound?: number;
  firCountInbound?: number;
  pliCountInbound?: number;
  timestamp?: number;
};
export type AudioConsumerStats = {
  transport?: TransportStats;
  packetsLost?: number;
  bytesReceived?: number;
  packetsReceived?: number;
  nackCountInbound?: number;
  timestamp?: number;
};

export type ConsumerStatsSnapshot = {
  transport?: TransportStats;
  video: Map<string, VideoConsumerStats>;
  audio: Map<string, AudioConsumerStats>;
};

export type SfuStatsSnapshot = {
  producer?: ProducerStatsSnapshot;
  consumer?: ConsumerStatsSnapshot;
};
