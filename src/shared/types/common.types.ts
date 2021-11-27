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

export type TransportStats = {
  bytesSent?: number;
  bytesReceived?: number;
  packetsSent?: number;
  packetsReceived?: number;
  timestamp?: number;
};

export type BaseConsumerStats = {
  packetsLost?: number;
  bytesReceived?: number;
  packetsReceived?: number;
  nackCountInbound?: number;
  jitter?: number;
  timestamp?: number;
};

export type BaseProducerStats = {
  bitrate?: number;
  byteCount?: number;
  nackCount?: number;
  packetCount?: number;
  packetsLost?: number;
  jitter?: number;
  timestamp: number;
};
export type VideoConsumerStats = BaseConsumerStats & {
  framesReceived?: number;
  framesDecoded?: number;
  qpSumInbound?: number;
  firCountInbound?: number;
  pliCountInbound?: number;
  framesDropped?: number;
  remoteFrameHeight?: number;
  remoteFrameWidth?: number;
};

type VideoInboundStats = {
  framesReceived?: number;
  framesDecoded?: number;
  qpSumInbound?: number;
  firCountInbound?: number;
  pliCountInbound?: number;
  qualityLimitationReason?: 'none' | 'cpu' | 'bandwidth' | 'other';
  framesDropped?: number;
  remoteFrameHeight?: number;
  remoteFrameWidth?: number;
};
type VideoOutboundStats = {
  framesSent?: number;
  framesEncoded?: number;
  qpSumOutbound?: number;
  firCountOutbound?: number;
  pliCountOutbound?: number;
  localFrameHeight?: number;
  localFrameWidth?: number;
};

type BaseInboundStats = {
  bytesReceived?: number;
  packetsReceived?: number;
  packetsLost?: number;
  jitter?: number;
  nackCountInbound?: number;
  timestamp?: number;
};
type BaseOutboundStats = {
  bytesSent?: number;
  packetsSent?: number;
  nackCountOutbound?: number;
  timestamp?: number;
};

export type P2PVideoStats = BaseOutboundStats &
  BaseInboundStats &
  VideoOutboundStats &
  VideoInboundStats;

export type P2PAudioStats = BaseOutboundStats & BaseInboundStats;

export type VideoProducerStats = BaseProducerStats & {
  firCount?: number;
  pliCount?: number;
};

export type AudioProducerStats = BaseProducerStats;

export type AudioConsumerStats = BaseConsumerStats;

export type ProducerStatsSnapshot = {
  transport?: TransportStats;
  video?: VideoProducerStats;
  audio?: AudioProducerStats;
};

export type ConsumerMediaStats = {
  video?: VideoConsumerStats;
  audio?: AudioConsumerStats;
};

export type ConsumerStatsSnapshot = {
  transport?: TransportStats;
  media: Record<string, ConsumerMediaStats>;
};

export type P2PStatsSnapshot = {
  transport?: TransportStats;
  video?: P2PVideoStats;
  audio?: P2PAudioStats;
};

export type SfuStatsSnapshot = {
  producer?: ProducerStatsSnapshot;
  consumer?: ConsumerStatsSnapshot;
};
