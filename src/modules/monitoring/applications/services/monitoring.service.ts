import { Injectable, Logger } from '@nestjs/common';
import { MeetingMemberSnapshotEntityRepository } from '../../infrastructure/repositories/meeting-member-snapshot-entity.repository';
import { MeetingMemberSnapshotDtoRepository } from '../../infrastructure/repositories/meeting-member-snapshot-dto.repository';
import { EventPublisher } from '@nestjs/cqrs';
import { MeetingMemberSnapshotFactory } from '../../domain/meeting-member-snapshot.factory';

@Injectable()
export class MonitoringService {
  constructor(
    private meetingMemberSnapshotDtoRepository: MeetingMemberSnapshotDtoRepository,
    private meetingMemberSnapshotEntityRepository: MeetingMemberSnapshotEntityRepository,
    private meetingMemberSnapshotFactory: MeetingMemberSnapshotFactory,
    private readonly eventPublisher: EventPublisher,
  ) {}
  private templateP2P = {
    video: {
      bytesSent: 0,
      bytesReceived: 0,
      jitter: 0,
      packetsSent: 0,
      packetsReceived: 0,
      packetsLost: 0,
      nackCountInbound: 0,
      nackCountOutbound: 0,
      firCountOutbound: 0,
      firCountInbound: 0,
      qpSumOutbound: 0,
      qpSumInbound: 0,
      pliCountOutbound: 0,
      pliCountInbound: 0,
      framesSent: 0,
      framesReceived: 0,
      framesDropped: 0, //
      framesEncoded: 0,
      framesDecoded: 0,
      qualityLimitationBandwidth: 0,
      qualityLimitationCpu: 0,
      qualityLimitationOther: 0,
      localFrameResolution: 'none',
      remoteFrameResolution: 'none',
    },
    audio: {
      bytesSent: 0,
      bytesReceived: 0,
      jitter: 0,
      packetsSent: 0,
      packetsLost: 0,
      packetsReceived: 0,
      nackCountInbound: 0,
      nackCountOutbound: 0,
    },
    transport: {
      bytesSent: 0,
      bytesReceived: 0,
      packetsSent: 0,
      packetsReceived: 0,
    },
  };
  private templateConsumerStats: Record<string, any> = {
    video: {
      packetsReceived: 0,
      packetsLost: 0,
      framesReceived: 0,
      bytesReceived: 0,
      framesDecoded: 0,
      pliCountInbound: 0,
      firCountInbound: 0,
      nackCountInbound: 0,
      jitter: 0,
    },
    audio: {
      nackCountInbound: 0,
      packetsReceived: 0,
      packetsLost: 0,
      bytesReceived: 0,
      jitter: 0,
    },
    transport: {
      bytesSent: 0,
      bytesReceived: 0,
      packetsSent: 0,
      packetsReceived: 0,
    },
  };

  private logger: Logger = new Logger('Monitoring Service');

  async addMeetingMemberSnapshot(addMeetingMemberRequest: any): Promise<any> {
    const snapshot = this.eventPublisher.mergeObjectContext(
      await this.meetingMemberSnapshotFactory.create(
        addMeetingMemberRequest.meetingId,
        addMeetingMemberRequest.meetingMemberId,
        addMeetingMemberRequest.p2pSnapshots,
        addMeetingMemberRequest.sfuSnapshot,
        addMeetingMemberRequest.activeP2PConnections,
        addMeetingMemberRequest.activeSFUConnections,
        addMeetingMemberRequest.timestamp,
      ),
    );
    snapshot.commit();
    return this.getStats(addMeetingMemberRequest.meetingMemberId);
  }

  async getMeetingMemberListFromMeeting(
    meetingId: string,
    page: number,
    size: number,
  ): Promise<any> {
    return this.meetingMemberSnapshotDtoRepository
      .findMeetingMembers(meetingId, page, size)
      .then((result) => {
        const meetingMembersDto: Record<string, any> = {};
        const paginatedResults = result[0].paginatedResults;
        meetingMembersDto.recordsTotal = result[0].totalCount[0].count;
        meetingMembersDto.data = paginatedResults;
        return meetingMembersDto;
      });
  }

  async getMeetings(page: number, size: number): Promise<any> {
    return this.meetingMemberSnapshotDtoRepository
      .findMeetings(page, size)
      .then((result) => {
        // return result;
        const meetingsDto: Record<string, any> = {};
        const paginatedResults = result[0].paginatedResults;
        meetingsDto.recordsTotal = result[0].recordsTotal[0].count;
        const results = [];
        paginatedResults.forEach((r) => {
          results.push({
            id: r._id,
            meetingMembers: r.meetingMembers.length,
            totalSnapshots: r.totalSnapshots,
          });
        });
        meetingsDto.data = results;
        return meetingsDto;
        // meetings.forEach((meeting) => {
        //   meeting['options'] = `<a href="/${meeting}"></a>`;
        // });
      });
  }

  private async getStats(meetingMemberId: string) {
    const snapshots =
      await this.meetingMemberSnapshotDtoRepository.findLastMeetingMemberSnapshot(
        meetingMemberId,
      );
    if (snapshots.length > 1) {
      const result: Record<string, any> = {
        p2pVideoBitrateSent: [],
        p2pVideoBitrateReceived: [],
        p2pTransportBitrateSent: [],
        p2pTransportBitrateReceived: [],
        p2pAudioBitrateReceived: [],
        p2pAudioBitrateSent: [],
        p2pTotalBitrateSent: [],
        p2pTotalBitrateReceived: [],
      };
      const summaryPreviousP2P: Record<string, any> = {};
      const summaryCurrentP2P: Record<string, any> = {};

      const summaryPreviousConsumer: Record<string, any> = {
        ...this.templateConsumerStats,
      };
      const summaryCurrentConsumer: Record<string, any> = {
        ...this.templateConsumerStats,
      };

      for (const [key, report] of snapshots[0].p2pSnapshots) {
        if (report.video) {
          summaryCurrentP2P[key] = {
            ...summaryCurrentP2P[key],
            video: {
              ...this.templateP2P.video,
              timestamp: report.video.timestamp,
            },
          };
          summaryCurrentP2P[key].video.framesReceived +=
            report.video.framesReceived;
          summaryCurrentP2P[key].video.framesSent += report.video.framesSent;
          summaryCurrentP2P[key].video.framesDecoded +=
            report.video.framesDecoded;
          summaryCurrentP2P[key].video.framesEncoded +=
            report.video.framesEncoded;
          summaryCurrentP2P[key].video.firCountInbound +=
            report.video.firCountInbound;
          summaryCurrentP2P[key].video.firCountOutbound +=
            report.video.firCountOutbound;
          summaryCurrentP2P[key].video.pliCountInbound +=
            report.video.pliCountInbound;
          summaryCurrentP2P[key].video.pliCountOutbound +=
            report.video.pliCountOutbound;
          summaryCurrentP2P[key].video.qpSumInbound +=
            report.video.qpSumInbound;
          summaryCurrentP2P[key].video.qpSumOutbound +=
            report.video.qpSumOutbound;
          summaryCurrentP2P[key].video.bytesReceived +=
            report.video.bytesReceived;
          summaryCurrentP2P[key].video.bytesSent += report.video.bytesSent;
          summaryCurrentP2P[key].video.packetsLost += report.video.packetsLost;
          summaryCurrentP2P[key].video.packetsReceived +=
            report.video.packetsReceived;
          summaryCurrentP2P[key].video.packetsSent += report.video.packetsSent;
          summaryCurrentP2P[key].video.jitter += report.video.jitter;
          summaryCurrentP2P[key].video.nackCountInbound +=
            report.video.nackCountInbound;
          summaryCurrentP2P[key].video.nackCountOutbound +=
            report.video.nackCountOutbound;
          switch (report.video.qualityLimitationReason) {
            case 'bandwidth':
              summaryCurrentP2P[key].video.qualityLimitationBandwidth++;
              break;
            case 'cpu':
              summaryCurrentP2P[key].video.qualityLimitationCpu++;
              break;
            case 'other':
              summaryCurrentP2P[key].video.qualityLimitationOther++;
              break;
          }
        }
        if (report.audio) {
          summaryCurrentP2P[key] = {
            ...summaryCurrentP2P[key],
            audio: {
              ...this.templateP2P.audio,
              timestamp: report.video.timestamp,
            },
          };
          summaryCurrentP2P[key].audio.bytesReceived +=
            report.audio.bytesReceived;
          summaryCurrentP2P[key].audio.bytesSent += report.audio.bytesSent;
          summaryCurrentP2P[key].audio.packetsLost += report.audio.packetsLost;
          summaryCurrentP2P[key].audio.packetsReceived +=
            report.audio.packetsReceived;
          summaryCurrentP2P[key].audio.packetsSent += report.audio.packetsSent;
          summaryCurrentP2P[key].audio.jitter += report.audio.jitter;
          summaryCurrentP2P[key].audio.nackCountInbound +=
            report.audio.nackCountInbound;
          summaryCurrentP2P[key].audio.nackCountOutbound +=
            report.audio.nackCountOutbound;
        }
        if (report.transport) {
          summaryCurrentP2P[key] = {
            ...summaryCurrentP2P[key],
            transport: {
              ...this.templateP2P.transport,
              timestamp: report.video.timestamp,
            },
          };
          summaryCurrentP2P[key].transport.timestamp =
            report.transport.timestamp;
          summaryCurrentP2P[key].transport.bytesReceived +=
            report.transport.bytesReceived;
          summaryCurrentP2P[key].transport.bytesSent +=
            report.transport.bytesSent;
          summaryCurrentP2P[key].transport.packetsReceived +=
            report.transport.packetsReceived;
          summaryCurrentP2P[key].transport.packetsSent +=
            report.transport.packetsSent;
        }
      }
      for (const [key, report] of snapshots[1].p2pSnapshots) {
        if (summaryCurrentP2P[key]) {
          if (report.video) {
            summaryPreviousP2P[key] = {
              ...summaryPreviousP2P[key],
              video: {
                ...this.templateP2P.video,
                timestamp: report.video.timestamp,
              },
            };
            summaryPreviousP2P[key].video.framesReceived =
              report.video.framesReceived;
            summaryPreviousP2P[key].video.framesSent = report.video.framesSent;
            summaryPreviousP2P[key].video.framesDecoded =
              report.video.framesDecoded;
            summaryPreviousP2P[key].video.framesEncoded =
              report.video.framesEncoded;
            summaryPreviousP2P[key].video.firCountInbound =
              report.video.firCountInbound;
            summaryPreviousP2P[key].video.firCountOutbound =
              report.video.firCountOutbound;
            summaryPreviousP2P[key].video.pliCountInbound =
              report.video.pliCountInbound;
            summaryPreviousP2P[key].video.pliCountOutbound = report.video
              .pliCountOutbound
              ? report.video.pliCountOutbound
              : 0;
            summaryPreviousP2P[key].video.qpSumInbound = report.video
              .qpSumInbound
              ? report.video.qpSumInbound
              : 0;
            summaryPreviousP2P[key].video.qpSumOutbound = report.video
              .qpSumOutbound
              ? report.video.qpSumOutbound
              : 0;
            summaryPreviousP2P[key].video.bytesReceived =
              report.video.bytesReceived;
            summaryPreviousP2P[key].video.bytesSent = report.video.bytesSent;
            summaryPreviousP2P[key].video.packetsLost =
              report.video.packetsLost;
            summaryPreviousP2P[key].video.packetsReceived =
              report.video.packetsReceived;
            summaryPreviousP2P[key].video.packetsSent =
              report.video.packetsSent;
            summaryPreviousP2P[key].video.jitter = report.video.jitter;
            summaryPreviousP2P[key].video.nackCountInbound =
              report.video.nackCountInbound;
            summaryPreviousP2P[key].video.nackCountOutbound =
              report.video.nackCountOutbound;

            switch (report.video.qualityLimitationReason) {
              case 'bandwidth':
                summaryPreviousP2P[key].video.qualityLimitationBandwidth++;
                break;
              case 'cpu':
                summaryPreviousP2P[key].video.qualityLimitationCpu++;
                break;
              case 'other':
                summaryPreviousP2P[key].video.qualityLimitationOther++;
                break;
            }
            summaryPreviousP2P[key].video.timestamp = report.video.timestamp;
          }
          if (report.audio) {
            summaryPreviousP2P[key] = {
              ...summaryPreviousP2P[key],
              audio: {
                ...this.templateP2P.audio,
                timestamp: report.video.timestamp,
              },
            };
            summaryPreviousP2P[key].audio.bytesReceived +=
              report.audio.bytesReceived;
            summaryPreviousP2P[key].audio.bytesSent += report.audio.bytesSent;
            summaryPreviousP2P[key].audio.packetsLost +=
              report.audio.packetsLost;
            summaryPreviousP2P[key].audio.packetsReceived +=
              report.audio.packetsReceived;
            summaryPreviousP2P[key].audio.packetsSent +=
              report.audio.packetsSent;
            summaryPreviousP2P[key].audio.jitter += report.audio.jitter;
            summaryPreviousP2P[key].audio.nackCountInbound +=
              report.audio.nackCountInbound;
            summaryPreviousP2P[key].audio.nackCountOutbound +=
              report.audio.nackCountOutbound;
            summaryPreviousP2P[key].audio.timestamp = report.audio.timestamp;
          }
          if (report.transport) {
            summaryPreviousP2P[key] = {
              ...summaryPreviousP2P[key],
              transport: {
                ...this.templateP2P.transport,
                timestamp: report.video.timestamp,
              },
            };
            summaryPreviousP2P[key].transport.timestamp =
              report.transport.timestamp;
            summaryPreviousP2P[key].transport.bytesReceived +=
              report.transport.bytesReceived;
            summaryPreviousP2P[key].transport.bytesSent +=
              report.transport.bytesSent;
            summaryPreviousP2P[key].transport.packetsReceived +=
              report.transport.packetsReceived;
            summaryPreviousP2P[key].transport.packetsSent +=
              report.transport.packetsSent;
          }
        }
      }
      for (const key in summaryCurrentP2P) {
        let p2pAudioBitrateSent = 0;
        let p2pVideoBitrateReceived = 0;
        let p2pAudioBitrateReceived = 0;
        let p2pVideoBitrateSent = 0;
        let p2pTransportBitrateReceived = 0;
        let p2pTransportBitrateSent = 0;
        if (summaryPreviousP2P[key]) {
          p2pVideoBitrateSent =
            8 *
            this.calculateRateInSeconds({
              previousValue: summaryPreviousP2P[key].video.bytesSent,
              currentValue: summaryCurrentP2P[key].video.bytesSent,
              previousTimestamp: summaryPreviousP2P[key].video.timestamp,
              currentTimestamp: summaryCurrentP2P[key].video.timestamp,
            });
          p2pAudioBitrateSent =
            8 *
            this.calculateRateInSeconds({
              previousValue: summaryPreviousP2P[key].audio.bytesSent,
              currentValue: summaryCurrentP2P[key].audio.bytesSent,
              previousTimestamp: summaryPreviousP2P[key].audio.timestamp,
              currentTimestamp: summaryCurrentP2P[key].audio.timestamp,
            });
          p2pVideoBitrateReceived =
            8 *
            this.calculateRateInSeconds({
              previousValue: summaryPreviousP2P[key].video.bytesReceived,
              currentValue: summaryCurrentP2P[key].video.bytesReceived,
              previousTimestamp: summaryPreviousP2P[key].video.timestamp,
              currentTimestamp: summaryCurrentP2P[key].video.timestamp,
            });
          p2pAudioBitrateReceived =
            8 *
            this.calculateRateInSeconds({
              previousValue: summaryPreviousP2P[key].audio.bytesReceived,
              currentValue: summaryCurrentP2P[key].audio.bytesReceived,
              previousTimestamp: summaryPreviousP2P[key].audio.timestamp,
              currentTimestamp: summaryCurrentP2P[key].audio.timestamp,
            });

          p2pTransportBitrateSent =
            8 *
            this.calculateRateInSeconds({
              currentValue: summaryCurrentP2P[key].transport.bytesSent,
              previousValue: summaryPreviousP2P[key].transport.bytesSent,
              currentTimestamp: summaryCurrentP2P[key].transport.timestamp,
              previousTimestamp: summaryPreviousP2P[key].transport.timestamp,
            });
          p2pTransportBitrateReceived =
            8 *
            this.calculateRateInSeconds({
              currentValue: summaryCurrentP2P[key].transport.bytesReceived,
              previousValue: summaryPreviousP2P[key].transport.bytesReceived,
              currentTimestamp: summaryCurrentP2P[key].transport.timestamp,
              previousTimestamp: summaryPreviousP2P[key].transport.timestamp,
            });
        }

        if (p2pTransportBitrateReceived != 0) {
          result.p2pTransportBitrateReceived.push(p2pTransportBitrateReceived);
        }
        if (p2pTransportBitrateSent != 0) {
          result.p2pTransportBitrateSent.push(p2pTransportBitrateSent);
        }
        if (p2pAudioBitrateReceived != 0) {
          result.p2pAudioBitrateReceived.push(p2pAudioBitrateReceived);
        }
        if (p2pAudioBitrateSent) {
          result.p2pAudioBitrateSent.push(p2pAudioBitrateSent);
        }
        if (p2pVideoBitrateReceived) {
          result.p2pVideoBitrateReceived.push(p2pVideoBitrateReceived);
        }
        if (p2pVideoBitrateSent) {
          result.p2pVideoBitrateSent.push(p2pVideoBitrateSent);
        }
        if (p2pVideoBitrateReceived != 0 || p2pAudioBitrateReceived != 0) {
          result.p2pTotalBitrateReceived.push(
            p2pVideoBitrateReceived + p2pAudioBitrateReceived,
          );
        }
        if (p2pVideoBitrateReceived != 0 || p2pAudioBitrateReceived != 0) {
          result.p2pTotalBitrateSent.push(
            p2pVideoBitrateSent + p2pAudioBitrateSent,
          );
        }
      }

      summaryCurrentConsumer.transport =
        snapshots[0].sfuSnapshots.consumer.transport;
      summaryPreviousConsumer.transport =
        snapshots[1].sfuSnapshots.consumer.transport;

      const consumerVideoBitrateReceived =
        8 *
        this.calculateRateInSeconds({
          currentValue: summaryCurrentConsumer.video.bytesReceived,
          previousValue: summaryPreviousConsumer.video.bytesReceived,
          currentTimestamp: summaryCurrentConsumer.video.timestamp,
          previousTimestamp: summaryPreviousConsumer.video.timestamp,
        });
      const consumerAudioBitrateReceived =
        8 *
        this.calculateRateInSeconds({
          currentValue: summaryCurrentConsumer.audio.bytesReceived,
          previousValue: summaryPreviousConsumer.audio.bytesReceived,
          currentTimestamp: summaryCurrentConsumer.audio.timestamp,
          previousTimestamp: summaryPreviousConsumer.audio.timestamp,
        });
      const consumerTransportBitrateReceived =
        8 *
        this.calculateRateInSeconds({
          previousTimestamp: summaryPreviousConsumer.transport.timestamp,
          currentTimestamp: summaryCurrentConsumer.transport.timestamp,
          previousValue: summaryPreviousConsumer.transport.bytesReceived,
          currentValue: summaryCurrentConsumer.transport.bytesReceived,
        });
      const producerVideoBitrate =
        snapshots[0].sfuSnapshots.producer.video.bitrate;
      const producerAudioBitrate =
        snapshots[0].sfuSnapshots.producer.audio.bitrate;

      const producerTransportBitrateSent =
        8 *
        this.calculateRateInSeconds({
          currentValue: snapshots[0].sfuSnapshots.producer.transport.bytesSent,
          previousValue: snapshots[1].sfuSnapshots.producer.transport.bytesSent,
          currentTimestamp:
            snapshots[0].sfuSnapshots.producer.transport.timestamp,
          previousTimestamp:
            snapshots[1].sfuSnapshots.producer.transport.timestamp,
        });
      const producerTransportBitrateReceived =
        8 *
        this.calculateRateInSeconds({
          currentValue:
            snapshots[0].sfuSnapshots.producer.transport.bytesReceived,
          previousValue:
            snapshots[1].sfuSnapshots.producer.transport.bytesReceived,
          currentTimestamp:
            snapshots[0].sfuSnapshots.producer.transport.timestamp,
          previousTimestamp:
            snapshots[1].sfuSnapshots.producer.transport.timestamp,
        });

      return {
        ...result,
        consumerVideoBitrateReceived: consumerVideoBitrateReceived,
        consumerAudioBitrateReceived: consumerAudioBitrateReceived,
        consumerTransportBitrateReceived: consumerTransportBitrateReceived,

        producerVideoBitrate: producerVideoBitrate,
        producerAudioBitrate: producerAudioBitrate,
        producerTransportBitrateSent: producerTransportBitrateSent,
        producerTransportBitrateReceived: producerTransportBitrateReceived,
      };
    } else {
      return {
        p2pVideoBitrateSent: [],
        p2pVideoBitrateReceived: [],
        p2pAudioBitrateSent: [],
        p2pAudioBitrateReceived: [],
        p2pTransportBitrateSent: [],
        p2pTransportBitrateReceived: [],

        consumerVideoBitrateReceived: 0,
        consumerAudioBitrateReceived: 0,
        consumerTransportBitrateReceived: 0,

        producerVideoBitrate: 0,
        producerAudioBitrate: 0,
        producerTransportBitrateSent: 0,
        producerTransportBitrateReceived: 0,
      };
    }
  }

  private calculateRateInSeconds(data: {
    previousValue: number;
    currentValue: number;
    previousTimestamp: number;
    currentTimestamp: number;
  }) {
    let diffTimestampInSeconds =
      (data.currentTimestamp - data.previousTimestamp) / 1000;
    let diffValues = data.currentValue - data.previousValue;
    if (diffValues < 0) {
      diffValues = data.currentValue;
    }
    if (!diffTimestampInSeconds) {
      diffTimestampInSeconds = 10;
    }
    return diffValues / diffTimestampInSeconds;
  }

  async getMeetingMembersSnapshotsFromMeeting(
    meetingId: string,
    meetingMemberId: string,
  ): Promise<any> {
    return this.meetingMemberSnapshotDtoRepository
      .findMeetingMemberSnapshots(meetingId, meetingMemberId)
      .then((snapshots) => {
        const summary: Record<string, any> = {
          dataVideoBytesSentP2P: [],
          dataVideoBytesReceivedP2P: [],
          dataVideoPacketsSentP2P: [],
          dataVideoPacketsLostP2P: [],
          dataVideoPacketsReceivedP2P: [],
          dataVideoFramesSentP2P: [],
          dataVideoFramesReceivedP2P: [],
          dataVideoFramesDroppedP2P: [],
          dataVideoFramesDecodedP2P: [],
          dataVideoFramesEncodedP2P: [],
          dataVideoAvgFramesSentP2P: [],
          dataVideoAvgFramesReceivedP2P: [],
          dataVideoAvgFramesDroppedP2P: [],
          dataVideoAvgFramesEncodedP2P: [],
          dataVideoAvgFramesDecodedP2P: [],
          dataVideoBitrateSentP2P: [],
          dataVideoBitrateReceivedP2P: [],
          dataVideoNackCountInboundP2P: [],
          dataVideoNackCountOutboundP2P: [],
          dataVideoFirCountInboundP2P: [],
          dataVideoFirCountOutboundP2P: [],
          dataVideoPliCountInboundP2P: [],
          dataVideoPliCountOutboundP2P: [],
          dataVideoQpSumInboundP2P: [],
          dataVideoQpSumOutboundP2P: [],
          dataVideoAvgQpInboundP2P: [],
          dataVideoAvgQpOutboundP2P: [],
          dataVideoAvgJitterP2P: [],
          dataTotalConnections: [],
          dataVideoQualityLimitationBandwidth: [],
          dataVideoQualityLimitationCpu: [],
          dataVideoQualityLimitationOther: [],
          dataVideoLocalResolutions: [],
          dataVideoRemoteResolutions: [],

          dataAudioBytesSentP2P: [],
          dataAudioBytesReceivedP2P: [],
          dataAudioPacketsSentP2P: [],
          dataAudioPacketsLostP2P: [],
          dataAudioPacketsReceivedP2P: [],
          dataAudioNackCountInboundP2P: [],
          dataAudioNackCountOutboundP2P: [],
          dataAudioBitrateSentP2P: [],
          dataAudioBitrateReceivedP2P: [],
          dataAudioAvgJitterP2P: [],
          dataTransportBitrateSentP2P: [],
          dataTransportBitrateReceivedP2P: [],
          dataTransportBytesSentP2P: [],
          dataTransportBytesReceivedP2P: [],
          dataTransportPacketsSentP2P: [],
          dataTransportPacketsReceivedP2P: [],

          dataAudioBitrateSentSFU: [],
          dataAudioBytesSentSFU: [],
          dataAudioBitrateReceivedSFU: [],
          dataAudioBytesReceivedSFU: [],
          dataAudioAvgJitterInboundSFU: [],
          dataAudioJitterOutboundSFU: [],
          dataAudioPacketsSentSFU: [],
          dataAudioPacketsLostOutboundSFU: [],
          dataAudioPacketsReceivedSFU: [],
          dataAudioPacketsLostSFU: [],

          dataVideoBitrateReceivedSFU: [],
          dataVideoBytesSentSFU: [],
          dataVideoBytesReceivedSFU: [],
          dataVideoPacketsSentSFU: [],
          dataVideoPacketsReceivedSFU: [],
          dataVideoPacketsLostSFU: [],
          dataVideoJitterOutboundSFU: [],
          dataVideoPacketsLostOutboundSFU: [],
          dataVideoFramesReceivedSFU: [],
          dataVideoFramesDroppedSFU: [],
          dataVideoFramesDecodedSFU: [],

          dataVideoNackCountInboundSFU: [],
          dataVideoFirCountInboundSFU: [],
          dataVideoPliCountInboundSFU: [],

          dataVideoNackCountOutboundSFU: [],
          dataVideoFirCountOutboundSFU: [],
          dataVideoPliCountOutboundSFU: [],

          dataVideoAvgJitterInboundSFU: [],
          dataVideoAvgFramesReceivedSFU: [],
          dataVideoAvgFramesDroppedSFU: [],
          dataVideoAvgFramesDecodedSFU: [],

          dataTransportBytesReceivedSFU: [],
          dataTransportBytesSentSFU: [],
          dataTransportBitrateSentSFU: [],
          dataTransportBitrateReceivedSFU: [],
          dataTransportPacketsSentSFU: [],
          dataTransportPacketsReceivedSFU: [],

          dataCurrentP2PConnections: [],
          dataCurrentSFUConnections: [],
          dataTotalBytesSentP2P: [],
          dataTotalBytesReceivedP2P: [],
          dataTotalPacketsSentP2P: [],
          dataTotalPacketsLostP2P: [],
          dataTotalPacketsReceivedP2P: [],
          dataTotalBitrateSentP2P: [],
          dataTotalBitrateReceivedP2P: [],
          labelsP2P: [],
          p2pRemoteResolutions: {},
          p2pLocalResolutions: {},
          sfuRemoteResolutions: {},
          test: [],
          dataVideoAvgBitrateSentP2P: [],
          dataVideoAvgBitrateReceivedP2P: [],
          dataAudioAvgBitrateSentP2P: [],
          dataAudioAvgBitrateReceivedP2P: [],

          dataVideoAvgBitrateReceivedSFU: [],
          dataAudioAvgBitrateSentSFU: [],
          dataAudioAvgBitrateReceivedSFU: [],
          dataTotalAvgVideoBitrateSent: [],
          dataTotalAvgAudioBitrateSent: [],
          dataTotalAvgVideoBitrateReceived: [],
          dataTotalAvgAudioBitrateReceived: [],
          dataVideoBitrateSentSFU: [],
        };
        const firstSnapshot = snapshots[0];
        let resume = 0;
        if (snapshots.length > 1) {
          const firstTimestamp = firstSnapshot.timestamp
            ? firstSnapshot.timestamp
            : firstSnapshot.sfuSnapshots.producer.transport.timestamp;
          for (let i = 1; i < snapshots.length; i++) {
            const previousSnapshot = snapshots[i - 1];
            const currentSnapshot = snapshots[i];
            const currentTimestamp = currentSnapshot.timestamp
              ? currentSnapshot.timestamp
              : currentSnapshot.sfuSnapshots.producer.transport.timestamp;
            const previousTimestamp = previousSnapshot.timestamp
              ? previousSnapshot.timestamp
              : previousSnapshot.sfuSnapshots.producer.transport.timestamp;
            const result: Record<string, any> = {
              p2pVideoBytesSent: [],
              p2pVideoBytesReceived: [],
              p2pVideoBitrateSent: [],
              p2pVideoBitrateReceived: [],
              p2pVideoPacketsSent: [],
              p2pVideoPacketsReceived: [],
              p2pVideoPacketsLost: [],
              p2pVideoNackCountInbound: [],
              p2pVideoNackCountOutbound: [],
              p2pVideoFramesSent: [],
              p2pVideoFramesReceived: [],
              p2pVideoFramesDropped: [],
              p2pVideoFramesEncoded: [],
              p2pVideoFramesDecoded: [],
              p2pVideoFirCountInbound: [],
              p2pVideoFirCountOutbound: [],
              p2pVideoPliCountInbound: [],
              p2pVideoPliCountOutbound: [],
              p2pVideoQpSumInbound: [],
              p2pVideoQpSumOutbound: [],
              p2pVideoQualityLimitations: [],
              p2pVideoLocalResolutions: [],
              p2pVideoRemoteResolutions: [],
              p2pVideoJitter: [],
              p2pVideoQualityLimitationBandwidth: [],
              p2pVideoQualityLimitationCpu: [],
              p2pVideoQualityLimitationOther: [],
              p2pVideoLocalResolution: {},
              p2pVideoRemoteResolution: {},
              p2pVideoQpInbound: [],
              p2pVideoQpOutbound: [],

              p2pAudioBitrateReceived: [],
              p2pAudioBitrateSent: [],
              p2pAudioBytesSent: [],
              p2pAudioBytesReceived: [],
              p2pAudioPacketsSent: [],
              p2pAudioPacketsReceived: [],
              p2pAudioPacketsLost: [],
              p2pAudioNackCountInbound: [],
              p2pAudioNackCountOutbound: [],
              p2pAudioJitter: [],

              p2pTotalBitrateSent: [],
              p2pTotalBitrateReceived: [],
              p2pTotalBytesSent: [],
              p2pTotalBytesReceived: [],
              p2pTotalPacketsSent: [],
              p2pTotalPacketsReceived: [],
              p2pTotalPacketsLost: [],

              p2pTransportBitrateSent: [],
              p2pTransportBitrateReceived: [],
              p2pTransportBytesSent: [],
              p2pTransportBytesReceived: [],
              p2pTransportPacketsSent: [],
              p2pTransportPacketsReceived: [],

              consumerVideoBitrateReceived: [],
              consumerAudioBitrateReceived: [],

              sfuVideoRemoteResolutions: [],
              avgVideoBitrateSent: [],
              avgVideoBitrateReceived: [],
              avgAudioBitrateSent: [],
              avgAudioBitrateReceived: [],
            };
            const sfuVideoRemoteResolution: Record<string, any> = {};
            let videoBytesSent = 0;
            let videoBytesReceived = 0;
            let videoPacketsSent = 0;
            let videoPacketsLost = 0;
            let videoPacketsReceived = 0;
            let videoNackCountInbound = 0;
            let videoNackCountOutbound = 0;
            let videoFirCountInbound = 0;
            let videoFirCountOutbound = 0;
            let videoPliCountInbound = 0;
            let videoPliCountOutbound = 0;
            let videoQpSumInbound = 0;
            let videoQpSumOutbound = 0;
            let videoBitrateSent = 0;
            let videoBitrateReceived = 0;
            let videoQualityLimitationBandwidthCpu = 0;
            let videoQualityLimitationBandwidthBandwidth = 0;
            let videoQualityLimitationBandwidthOther = 0;
            let videoFramesSent = 0;
            let videoFramesReceived = 0;
            let videoFramesDropped = 0;
            let videoFramesEncoded = 0;
            let videoFramesDecoded = 0;

            let audioBytesSent = 0;
            let audioBytesReceived = 0;
            let audioPacketsSent = 0;
            let audioPacketsLost = 0;
            let audioPacketsReceived = 0;
            let audioBitrateSent = 0;
            let audioBitrateReceived = 0;
            let audioNackCountInbound = 0;
            let audioNackCountOutbound = 0;

            let transportBytesSent = 0;
            let transportBytesReceived = 0;
            let transportPacketsSent = 0;
            let transportPacketsReceived = 0;
            let transportBitrateSent = 0;
            let transportBitrateReceived = 0;

            let totalBytesSent = 0;
            let totalBytesReceived = 0;
            let totalPacketsSent = 0;
            let totalPacketsLost = 0;
            let totalPacketsReceived = 0;
            let totalBitrateSent = 0;
            let totalBitrateReceived = 0;

            const summaryPreviousP2P: Record<string, any> = {};
            const summaryCurrentP2P: Record<string, any> = {};
            const summaryPreviousConsumer: Record<string, any> = {
              ...this.templateConsumerStats,
            };
            const summaryCurrentConsumer: Record<string, any> = {
              ...this.templateConsumerStats,
            };
            //<editor-fold desc="P2P snapshots">
            for (const [key, report] of currentSnapshot.p2pSnapshots) {
              if (report.video) {
                summaryCurrentP2P[key] = {
                  ...summaryCurrentP2P[key],
                  video: {
                    ...this.templateP2P.video,
                    localResolutions: {},
                    remoteResolutions: {},
                    timestamp: report.video.timestamp,
                  },
                };
                summaryCurrentP2P[key].video.framesReceived += report.video
                  .framesReceived
                  ? report.video.framesReceived
                  : 0;
                summaryCurrentP2P[key].video.framesSent += report.video
                  .framesSent
                  ? report.video.framesSent
                  : 0;
                summaryCurrentP2P[key].video.framesDropped += report.video
                  .framesDropped
                  ? report.video.framesDropped
                  : 0;
                summaryCurrentP2P[key].video.framesDecoded += report.video
                  .framesDecoded
                  ? report.video.framesDecoded
                  : 0;
                summaryCurrentP2P[key].video.framesEncoded += report.video
                  .framesEncoded
                  ? report.video.framesEncoded
                  : 0;
                summaryCurrentP2P[key].video.firCountInbound += report.video
                  .firCountInbound
                  ? report.video.firCountInbound
                  : 0;
                summaryCurrentP2P[key].video.firCountOutbound += report.video
                  .firCountOutbound
                  ? report.video.firCountOutbound
                  : 0;
                summaryCurrentP2P[key].video.pliCountInbound += report.video
                  .pliCountInbound
                  ? report.video.pliCountInbound
                  : 0;
                summaryCurrentP2P[key].video.pliCountOutbound += report.video
                  .pliCountOutbound
                  ? report.video.pliCountOutbound
                  : 0;
                summaryCurrentP2P[key].video.qpSumInbound += report.video
                  .qpSumInbound
                  ? report.video.qpSumInbound
                  : 0;
                summaryCurrentP2P[key].video.qpSumOutbound += report.video
                  .qpSumOutbound
                  ? report.video.qpSumOutbound
                  : 0;
                summaryCurrentP2P[key].video.bytesReceived += report.video
                  .bytesReceived
                  ? report.video.bytesReceived
                  : 0;
                summaryCurrentP2P[key].video.bytesSent += report.video.bytesSent
                  ? report.video.bytesSent
                  : 0;
                summaryCurrentP2P[key].video.packetsLost += report.video
                  .packetsLost
                  ? report.video.packetsLost
                  : 0;
                summaryCurrentP2P[key].video.packetsReceived += report.video
                  .packetsReceived
                  ? report.video.packetsReceived
                  : 0;
                summaryCurrentP2P[key].video.packetsSent += report.video
                  .packetsSent
                  ? report.video.packetsSent
                  : 0;
                summaryCurrentP2P[key].video.jitter += report.video.jitter
                  ? report.video.jitter
                  : 0;
                summaryCurrentP2P[key].video.nackCountInbound += report.video
                  .nackCountInbound
                  ? report.video.nackCountInbound
                  : 0;
                summaryCurrentP2P[key].video.nackCountOutbound += report.video
                  .nackCountOutbound
                  ? report.video.nackCountOutbound
                  : 0;

                if (report.video.localFrameWidth) {
                  summaryCurrentP2P[
                    key
                  ].video.localFrameResolution = `${report.video.localFrameWidth}x${report.video.localFrameHeight}`;
                }
                if (report.video.remoteFrameWidth) {
                  summaryCurrentP2P[
                    key
                  ].video.remoteFrameResolution = `${report.video.remoteFrameWidth}x${report.video.remoteFrameHeight}`;
                }

                switch (report.video.qualityLimitationReason) {
                  case 'bandwidth':
                    summaryCurrentP2P[key].video.qualityLimitationBandwidth++;
                    break;
                  case 'cpu':
                    summaryCurrentP2P[key].video.qualityLimitationCpu++;
                    break;
                  case 'other':
                    summaryCurrentP2P[key].video.qualityLimitationOther++;
                    break;
                }
              }
              if (report.audio) {
                summaryCurrentP2P[key] = {
                  ...summaryCurrentP2P[key],
                  audio: {
                    ...this.templateP2P.audio,
                    timestamp: report.video.timestamp,
                  },
                };
                summaryCurrentP2P[key].audio.bytesReceived += report.audio
                  .bytesReceived
                  ? report.audio.bytesReceived
                  : 0;
                summaryCurrentP2P[key].audio.bytesSent += report.audio.bytesSent
                  ? report.audio.bytesSent
                  : 0;
                summaryCurrentP2P[key].audio.packetsLost += report.audio
                  .packetsLost
                  ? report.audio.packetsLost
                  : 0;
                summaryCurrentP2P[key].audio.packetsReceived += report.audio
                  .packetsReceived
                  ? report.audio.packetsReceived
                  : 0;
                summaryCurrentP2P[key].audio.packetsSent += report.audio
                  .packetsSent
                  ? report.audio.packetsSent
                  : 0;
                summaryCurrentP2P[key].audio.jitter += report.audio.jitter
                  ? report.audio.jitter
                  : 0;
                summaryCurrentP2P[key].audio.nackCountInbound += report.audio
                  .nackCountInbound
                  ? report.audio.nackCountInbound
                  : 0;
                summaryCurrentP2P[key].audio.nackCountOutbound += report.audio
                  .nackCountOutbound
                  ? report.audio.nackCountOutbound
                  : 0;
              }
              if (report.transport) {
                summaryCurrentP2P[key] = {
                  ...summaryCurrentP2P[key],
                  transport: {
                    ...this.templateP2P.transport,
                    timestamp: report.video.timestamp,
                  },
                };
                summaryCurrentP2P[key].transport.timestamp =
                  report.transport.timestamp;
                summaryCurrentP2P[key].transport.bytesReceived += report
                  .transport.bytesReceived
                  ? report.transport.bytesReceived
                  : 0;
                summaryCurrentP2P[key].transport.bytesSent += report.transport
                  .bytesSent
                  ? report.transport.bytesSent
                  : 0;
                summaryCurrentP2P[key].transport.packetsReceived += report
                  .transport.packetsReceived
                  ? report.transport.packetsReceived
                  : 0;
                summaryCurrentP2P[key].transport.packetsSent += report.transport
                  .packetsSent
                  ? report.transport.packetsSent
                  : 0;
              }
            }
            for (const [key, report] of previousSnapshot.p2pSnapshots) {
              if (summaryCurrentP2P[key]) {
                if (report.video) {
                  summaryPreviousP2P[key] = {
                    ...summaryPreviousP2P[key],
                    video: {
                      ...this.templateP2P.video,
                      timestamp: report.video.timestamp,
                    },
                  };
                  summaryPreviousP2P[key].video.framesReceived = report.video
                    .framesReceived
                    ? report.video.framesReceived
                    : 0;
                  summaryPreviousP2P[key].video.framesSent = report.video
                    .framesSent
                    ? report.video.framesSent
                    : 0;
                  summaryPreviousP2P[key].video.framesDecoded = report.video
                    .framesDecoded
                    ? report.video.framesDecoded
                    : 0;
                  summaryPreviousP2P[key].video.framesDropped = report.video
                    .framesDropped
                    ? report.video.framesDropped
                    : 0;
                  summaryPreviousP2P[key].video.framesEncoded = report.video
                    .framesEncoded
                    ? report.video.framesEncoded
                    : 0;
                  summaryPreviousP2P[key].video.firCountInbound = report.video
                    .firCountInbound
                    ? report.video.firCountInbound
                    : 0;
                  summaryPreviousP2P[key].video.firCountOutbound = report.video
                    .firCountOutbound
                    ? report.video.firCountOutbound
                    : 0;
                  summaryPreviousP2P[key].video.pliCountInbound = report.video
                    .pliCountInbound
                    ? report.video.pliCountInbound
                    : 0;
                  summaryPreviousP2P[key].video.pliCountOutbound = report.video
                    .pliCountOutbound
                    ? report.video.pliCountOutbound
                    : 0;
                  summaryPreviousP2P[key].video.qpSumInbound = report.video
                    .qpSumInbound
                    ? report.video.qpSumInbound
                    : 0;
                  summaryPreviousP2P[key].video.qpSumOutbound = report.video
                    .qpSumOutbound
                    ? report.video.qpSumOutbound
                    : 0;
                  summaryPreviousP2P[key].video.bytesReceived = report.video
                    .bytesReceived
                    ? report.video.bytesReceived
                    : 0;
                  summaryPreviousP2P[key].video.bytesSent = report.video
                    .bytesSent
                    ? report.video.bytesSent
                    : 0;
                  summaryPreviousP2P[key].video.packetsLost = report.video
                    .packetsLost
                    ? report.video.packetsLost
                    : 0;
                  summaryPreviousP2P[key].video.packetsReceived = report.video
                    .packetsReceived
                    ? report.video.packetsReceived
                    : 0;
                  summaryPreviousP2P[key].video.packetsSent = report.video
                    .packetsSent
                    ? report.video.packetsSent
                    : 0;
                  summaryPreviousP2P[key].video.jitter = report.video.jitter
                    ? report.video.jitter
                    : 0;
                  summaryPreviousP2P[key].video.nackCountInbound = report.video
                    .nackCountInbound
                    ? report.video.nackCountInbound
                    : 0;
                  summaryPreviousP2P[key].video.nackCountOutbound = report.video
                    .nackCountOutbound
                    ? report.video.nackCountOutbound
                    : 0;
                  if (report.video.localFrameWidth) {
                    summaryPreviousP2P[
                      key
                    ].video.localFrameResolution = `${report.video.localFrameWidth}x${report.video.localFrameHeight}`;
                  }
                  if (report.video.remoteFrameWidth) {
                    summaryPreviousP2P[
                      key
                    ].video.remoteFrameResolution = `${report.video.remoteFrameWidth}x${report.video.remoteFrameHeight}`;
                  }

                  switch (report.video.qualityLimitationReason) {
                    case 'bandwidth':
                      summaryPreviousP2P[key].video
                        .qualityLimitationBandwidth++;
                      break;
                    case 'cpu':
                      summaryPreviousP2P[key].video.qualityLimitationCpu++;
                      break;
                    case 'other':
                      summaryPreviousP2P[key].video.qualityLimitationOther++;
                      break;
                  }
                  summaryPreviousP2P[key].video.timestamp =
                    report.video.timestamp;
                }
                if (report.audio) {
                  summaryPreviousP2P[key] = {
                    ...summaryPreviousP2P[key],
                    audio: {
                      ...this.templateP2P.audio,
                      timestamp: report.video.timestamp,
                    },
                  };
                  summaryPreviousP2P[key].audio.bytesReceived += report.audio
                    .bytesReceived
                    ? report.audio.bytesReceived
                    : 0;
                  summaryPreviousP2P[key].audio.bytesSent += report.audio
                    .bytesSent
                    ? report.audio.bytesSent
                    : 0;
                  summaryPreviousP2P[key].audio.packetsLost += report.audio
                    .packetsLost
                    ? report.audio.packetsLost
                    : 0;
                  summaryPreviousP2P[key].audio.packetsReceived += report.audio
                    .packetsReceived
                    ? report.audio.packetsReceived
                    : 0;
                  summaryPreviousP2P[key].audio.packetsSent += report.audio
                    .packetsSent
                    ? report.audio.packetsSent
                    : 0;
                  summaryPreviousP2P[key].audio.jitter += report.audio.jitter
                    ? report.audio.jitter
                    : 0;
                  summaryPreviousP2P[key].audio.nackCountInbound += report.audio
                    .nackCountInbound
                    ? report.audio.nackCountInbound
                    : 0;
                  summaryPreviousP2P[key].audio.nackCountOutbound += report
                    .audio.nackCountOutbound
                    ? report.audio.nackCountOutbound
                    : 0;
                  summaryPreviousP2P[key].audio.timestamp =
                    report.audio.timestamp;
                }
                if (report.transport) {
                  summaryPreviousP2P[key] = {
                    ...summaryPreviousP2P[key],
                    transport: {
                      ...this.templateP2P.transport,
                      timestamp: report.video.timestamp,
                    },
                  };
                  summaryPreviousP2P[key].transport.timestamp =
                    report.transport.timestamp;
                  summaryPreviousP2P[key].transport.bytesReceived += report
                    .transport.bytesReceived
                    ? report.transport.bytesReceived
                    : 0;
                  summaryPreviousP2P[key].transport.bytesSent += report
                    .transport.bytesSent
                    ? report.transport.bytesSent
                    : 0;
                  summaryPreviousP2P[key].transport.packetsReceived += report
                    .transport.packetsReceived
                    ? report.transport.packetsReceived
                    : 0;
                  summaryPreviousP2P[key].transport.packetsSent += report
                    .transport.packetsSent
                    ? report.transport.packetsSent
                    : 0;
                }
              }
            }
            for (const key in summaryCurrentP2P) {
              let p2pAudioBytesSent = 0;
              let p2pAudioBytesReceived = 0;
              let p2pAudioPacketsSent = 0;
              let p2pAudioPacketsReceived = 0;
              let p2pAudioPacketsLost = 0;
              let p2pAudioNackCountInbound = 0;
              let p2pAudioNackCountOutbound = 0;
              let p2pAudioBitrateSent = 0;
              let p2pAudioBitrateReceived = 0;

              let p2pVideoBytesSent = 0;
              let p2pVideoBytesReceived = 0;
              let p2pVideoFramesSent = 0;
              let p2pVideoFramesReceived = 0;
              let p2pVideoFramesDropped = 0;
              let p2pVideoFramesEncoded = 0;
              let p2pVideoFramesDecoded = 0;
              let p2pVideoNackCountInbound = 0;
              let p2pVideoNackCountOutbound = 0;
              let p2pVideoFirCountInbound = 0;
              let p2pVideoFirCountOutbound = 0;
              let p2pVideoQpSumInbound = 0;
              let p2pVideoQpSumOutbound = 0;
              let p2pVideoPliCountInbound = 0;
              let p2pVideoPliCountOutbound = 0;
              let p2pVideoPacketsSent = 0;
              let p2pVideoPacketsReceived = 0;
              let p2pVideoPacketsLost = 0;
              let p2pVideoBitrateSent = 0;
              let p2pVideoBitrateReceived = 0;
              let p2pVideoQualityLimitationBandwidth = 0;
              let p2pVideoQualityLimitationCpu = 0;
              let p2pVideoQualityLimitationOther = 0;

              let p2pTransportBitrateSent = 0;
              let p2pTransportBitrateReceived = 0;
              let p2pTransportPacketsSent = 0;
              let p2pTransportPacketsReceived = 0;
              let p2pTransportBytesSent = 0;
              let p2pTransportBytesReceived = 0;

              if (summaryPreviousP2P[key] && summaryCurrentP2P[key]) {
                //<editor-fold desc="Video Stats">
                if (
                  summaryCurrentP2P[key].video?.bytesSent &&
                  summaryCurrentP2P[key].video?.bytesSent != 0
                ) {
                  p2pVideoBytesSent =
                    summaryCurrentP2P[key].video.bytesSent -
                    summaryPreviousP2P[key].video.bytesSent;
                  if (p2pVideoBytesSent < 0) {
                    p2pVideoBytesSent = summaryCurrentP2P[key].video.bytesSent;
                  }
                }
                if (
                  summaryCurrentP2P[key].video?.bytesReceived &&
                  summaryCurrentP2P[key].video?.bytesReceived != 0
                ) {
                  p2pVideoBytesReceived =
                    summaryCurrentP2P[key].video.bytesReceived -
                    summaryPreviousP2P[key].video.bytesReceived;
                  if (p2pVideoBytesReceived < 0) {
                    p2pVideoBytesReceived =
                      summaryCurrentP2P[key].video.bytesReceived;
                  }
                }
                if (
                  summaryCurrentP2P[key].video?.framesSent &&
                  summaryCurrentP2P[key].video?.framesSent != 0
                ) {
                  p2pVideoFramesSent =
                    summaryCurrentP2P[key].video.framesSent -
                    summaryPreviousP2P[key].video.framesSent;
                  if (p2pVideoFramesSent < 0) {
                    p2pVideoFramesSent =
                      summaryCurrentP2P[key].video.framesSent;
                  }
                }
                if (
                  summaryCurrentP2P[key].video?.framesReceived &&
                  summaryCurrentP2P[key].video?.framesReceived != 0
                ) {
                  p2pVideoFramesReceived =
                    summaryCurrentP2P[key].video.framesReceived -
                    summaryPreviousP2P[key].video.framesReceived;
                  if (p2pVideoFramesReceived < 0) {
                    p2pVideoFramesReceived =
                      summaryCurrentP2P[key].video.framesReceived;
                  }
                }
                if (
                  summaryCurrentP2P[key]?.video?.framesDropped &&
                  summaryCurrentP2P[key]?.video?.framesDropped != 0
                ) {
                  p2pVideoFramesDropped =
                    summaryCurrentP2P[key].video.framesDropped -
                    summaryPreviousP2P[key].video.framesDropped;
                  if (p2pVideoFramesDropped < 0) {
                    p2pVideoFramesDropped =
                      summaryCurrentP2P[key].video.framesDropped;
                  }
                }

                if (
                  summaryCurrentP2P[key]?.video?.framesEncoded &&
                  summaryCurrentP2P[key]?.video?.framesEncoded != 0
                ) {
                  p2pVideoFramesEncoded =
                    summaryCurrentP2P[key].video.framesEncoded -
                    summaryPreviousP2P[key].video.framesEncoded;
                  if (p2pVideoFramesEncoded < 0) {
                    p2pVideoFramesEncoded =
                      summaryCurrentP2P[key].video.framesEncoded;
                  }
                }
                if (
                  summaryCurrentP2P[key]?.video?.framesDecoded &&
                  summaryCurrentP2P[key]?.video?.framesDecoded != 0
                ) {
                  p2pVideoFramesDecoded =
                    summaryCurrentP2P[key].video.framesDecoded -
                    summaryPreviousP2P[key].video.framesDecoded;
                  if (p2pVideoFramesDecoded < 0) {
                    p2pVideoFramesDecoded =
                      summaryCurrentP2P[key].video.framesDecoded;
                  }
                }
                if (
                  summaryCurrentP2P[key]?.video &&
                  summaryCurrentP2P[key]?.video.qualityLimitationBandwidth
                ) {
                  p2pVideoQualityLimitationBandwidth +=
                    summaryCurrentP2P[key].video.qualityLimitationBandwidth;
                }
                p2pVideoQualityLimitationCpu +=
                  summaryCurrentP2P[key].video.qualityLimitationCpu;
                p2pVideoQualityLimitationOther +=
                  summaryCurrentP2P[key].video.qualityLimitationOther;

                if (
                  summaryCurrentP2P[key].video?.nackCountInbound &&
                  summaryCurrentP2P[key]?.video?.nackCountInbound != 0
                ) {
                  p2pVideoNackCountInbound =
                    summaryCurrentP2P[key].video?.nackCountInbound -
                    summaryPreviousP2P[key].video?.nackCountInbound;
                  if (p2pVideoNackCountInbound < 0) {
                    p2pVideoNackCountInbound =
                      summaryCurrentP2P[key].video?.nackCountInbound;
                  }
                }
                if (
                  summaryCurrentP2P[key].video?.nackCountOutbound &&
                  summaryCurrentP2P[key].video?.nackCountOutbound != 0
                ) {
                  p2pVideoNackCountOutbound =
                    summaryCurrentP2P[key].video?.nackCountOutbound -
                    summaryPreviousP2P[key].video?.nackCountOutbound;
                  if (p2pVideoNackCountOutbound < 0) {
                    p2pVideoNackCountOutbound =
                      summaryCurrentP2P[key].video?.nackCountOutbound;
                  }
                }
                if (
                  summaryCurrentP2P[key].video?.firCountInbound &&
                  summaryCurrentP2P[key].video?.firCountInbound != 0
                ) {
                  p2pVideoFirCountInbound =
                    summaryCurrentP2P[key].video?.firCountInbound -
                    summaryPreviousP2P[key].video?.firCountInbound;
                  if (p2pVideoFirCountInbound < 0) {
                    p2pVideoFirCountInbound =
                      summaryCurrentP2P[key].video?.firCountInbound;
                  }
                }
                if (
                  summaryCurrentP2P[key].video?.firCountOutbound &&
                  summaryCurrentP2P[key].video?.firCountOutbound != 0
                ) {
                  p2pVideoFirCountOutbound =
                    summaryCurrentP2P[key].video?.firCountOutbound -
                    summaryPreviousP2P[key].video?.firCountOutbound;
                  if (p2pVideoFirCountOutbound < 0) {
                    p2pVideoFirCountOutbound =
                      summaryCurrentP2P[key].video?.firCountOutbound;
                  }
                }

                if (
                  summaryCurrentP2P[key].video?.qpSumInbound &&
                  summaryCurrentP2P[key].video?.qpSumInbound != 0
                ) {
                  p2pVideoQpSumInbound =
                    summaryCurrentP2P[key].video?.qpSumInbound -
                    summaryPreviousP2P[key].video?.qpSumInbound;
                  if (p2pVideoQpSumInbound < 0) {
                    p2pVideoQpSumInbound =
                      summaryCurrentP2P[key].video?.qpSumInbound;
                  }
                }
                if (
                  summaryCurrentP2P[key].video?.qpSumOutbound &&
                  summaryCurrentP2P[key].video?.qpSumOutbound != 0
                ) {
                  p2pVideoQpSumOutbound =
                    summaryCurrentP2P[key].video?.qpSumOutbound -
                    summaryPreviousP2P[key].video?.qpSumOutbound;
                  if (p2pVideoQpSumOutbound < 0) {
                    p2pVideoQpSumOutbound =
                      summaryCurrentP2P[key].video?.qpSumOutbound;
                  }
                }

                if (
                  summaryCurrentP2P[key].video?.pliCountInbound &&
                  summaryCurrentP2P[key].video?.pliCountInbound != 0
                ) {
                  p2pVideoPliCountInbound =
                    summaryCurrentP2P[key].video?.pliCountInbound -
                    summaryPreviousP2P[key].video?.pliCountInbound;
                  if (p2pVideoPliCountInbound < 0) {
                    p2pVideoPliCountInbound =
                      summaryCurrentP2P[key].video?.pliCountInbound;
                  }
                }
                if (
                  summaryCurrentP2P[key].video?.pliCountOutbound &&
                  summaryCurrentP2P[key].video?.pliCountOutbound != 0
                ) {
                  p2pVideoPliCountOutbound =
                    summaryCurrentP2P[key].video?.pliCountOutbound -
                    summaryPreviousP2P[key].video?.pliCountOutbound;
                  if (p2pVideoPliCountOutbound < 0) {
                    p2pVideoPliCountOutbound =
                      summaryCurrentP2P[key].video?.pliCountOutbound;
                  }
                }
                if (
                  summaryCurrentP2P[key].video?.packetsSent &&
                  summaryCurrentP2P[key].video?.packetsSent != 0
                ) {
                  p2pVideoPacketsSent =
                    summaryCurrentP2P[key].video?.packetsSent -
                    summaryPreviousP2P[key].video?.packetsSent;
                  if (p2pVideoPacketsSent < 0) {
                    p2pVideoPacketsSent =
                      summaryCurrentP2P[key].video?.packetsSent;
                  }
                }
                if (
                  summaryCurrentP2P[key].video?.packetsReceived &&
                  summaryCurrentP2P[key].video?.packetsReceived != 0
                ) {
                  p2pVideoPacketsReceived =
                    summaryCurrentP2P[key].video?.packetsReceived -
                    summaryPreviousP2P[key].video?.packetsReceived;
                  if (p2pVideoPacketsReceived < 0) {
                    p2pVideoPacketsReceived =
                      summaryCurrentP2P[key].video?.packetsReceived;
                  }
                }
                if (
                  summaryCurrentP2P[key].video?.packetsLost &&
                  summaryCurrentP2P[key].video?.packetsLost != 0
                ) {
                  p2pVideoPacketsLost =
                    summaryCurrentP2P[key].video?.packetsLost -
                    summaryPreviousP2P[key].video?.packetsLost;
                  // if (p2pVideoPacketsLost < 0) {
                  //   p2pVideoPacketsLost =
                  //     summaryCurrentP2P[key].video?.packetsLost;
                  // }
                }
                if (
                  summaryCurrentP2P[key].video?.bytesSent &&
                  summaryCurrentP2P[key].video?.bytesSent != 0
                ) {
                  p2pVideoBitrateSent =
                    8 *
                    this.calculateRateInSeconds({
                      previousValue: summaryPreviousP2P[key].video?.bytesSent,
                      currentValue: summaryCurrentP2P[key].video?.bytesSent,
                      previousTimestamp:
                        summaryPreviousP2P[key].video.timestamp,
                      currentTimestamp: summaryCurrentP2P[key].video.timestamp,
                    });
                }
                if (
                  summaryCurrentP2P[key].video?.bytesReceived &&
                  summaryCurrentP2P[key].video?.bytesReceived != 0
                ) {
                  p2pVideoBitrateReceived =
                    8 *
                    this.calculateRateInSeconds({
                      previousValue:
                        summaryPreviousP2P[key].video?.bytesReceived,
                      currentValue: summaryCurrentP2P[key].video?.bytesReceived,
                      previousTimestamp:
                        summaryPreviousP2P[key].video.timestamp,
                      currentTimestamp: summaryCurrentP2P[key].video.timestamp,
                    });
                }
                //</editor-fold>

                //<editor-fold desc="Audio Stats">
                if (
                  summaryCurrentP2P[key].audio?.bytesSent &&
                  summaryCurrentP2P[key].audio?.bytesSent != 0
                ) {
                  p2pAudioBytesSent =
                    summaryCurrentP2P[key].audio?.bytesSent -
                    summaryPreviousP2P[key].audio?.bytesSent;
                }
                if (
                  summaryCurrentP2P[key].audio?.bytesReceived &&
                  summaryCurrentP2P[key].audio?.bytesReceived != 0
                ) {
                  p2pAudioBytesReceived =
                    summaryCurrentP2P[key].audio?.bytesReceived -
                    summaryPreviousP2P[key].audio?.bytesReceived;
                }
                if (
                  summaryCurrentP2P[key].audio?.packetsSent &&
                  summaryCurrentP2P[key].audio?.packetsSent != 0
                ) {
                  p2pAudioPacketsSent =
                    summaryCurrentP2P[key].audio.packetsSent -
                    summaryPreviousP2P[key].audio.packetsSent;
                }
                if (
                  summaryCurrentP2P[key].audio?.packetsReceived &&
                  summaryCurrentP2P[key].audio?.packetsReceived != 0
                ) {
                  p2pAudioPacketsReceived =
                    summaryCurrentP2P[key].audio.packetsReceived -
                    summaryPreviousP2P[key].audio.packetsReceived;
                }
                if (
                  summaryCurrentP2P[key].audio?.packetsLost &&
                  summaryCurrentP2P[key].audio?.packetsLost != 0
                ) {
                  p2pAudioPacketsLost =
                    summaryCurrentP2P[key].audio.packetsLost -
                    summaryPreviousP2P[key].audio.packetsLost;
                }
                if (
                  summaryCurrentP2P[key].audio?.nackCountInbound &&
                  summaryCurrentP2P[key].audio?.nackCountInbound != 0
                ) {
                  p2pAudioNackCountInbound =
                    summaryCurrentP2P[key].audio?.nackCountInbound -
                    summaryPreviousP2P[key].audio?.nackCountInbound;
                }
                if (
                  summaryCurrentP2P[key].audio?.nackCountOutbound &&
                  summaryCurrentP2P[key].audio?.nackCountOutbound != 0
                ) {
                  p2pAudioNackCountOutbound =
                    summaryCurrentP2P[key].audio.nackCountOutbound -
                    summaryPreviousP2P[key].audio.nackCountOutbound;
                }
                if (
                  summaryCurrentP2P[key].audio?.bytesSent &&
                  summaryCurrentP2P[key].audio?.bytesSent != 0
                ) {
                  p2pAudioBitrateSent =
                    8 *
                    this.calculateRateInSeconds({
                      previousValue: summaryPreviousP2P[key].audio.bytesSent,
                      currentValue: summaryCurrentP2P[key].audio.bytesSent,
                      previousTimestamp:
                        summaryPreviousP2P[key].audio.timestamp,
                      currentTimestamp: summaryCurrentP2P[key].audio.timestamp,
                    });
                }
                if (
                  summaryCurrentP2P[key].audio?.bytesReceived &&
                  summaryCurrentP2P[key].audio?.bytesReceived != 0
                ) {
                  p2pAudioBitrateReceived =
                    8 *
                    this.calculateRateInSeconds({
                      previousValue:
                        summaryPreviousP2P[key].audio.bytesReceived,
                      currentValue: summaryCurrentP2P[key].audio.bytesReceived,
                      previousTimestamp:
                        summaryPreviousP2P[key].audio.timestamp,
                      currentTimestamp: summaryCurrentP2P[key].audio.timestamp,
                    });
                }
                //</editor-fold>

                //<editor-fold desc="TransportStats">
                if (summaryPreviousP2P[key].transport) {
                  if (
                    summaryCurrentP2P[key].transport?.bytesSent &&
                    summaryCurrentP2P[key].transport?.bytesSent != 0
                  ) {
                    p2pTransportBytesSent =
                      summaryCurrentP2P[key].transport.bytesSent -
                      summaryPreviousP2P[key].transport.bytesSent;
                  }
                  if (
                    summaryCurrentP2P[key].transport?.bytesReceived &&
                    summaryCurrentP2P[key].transport?.bytesReceived != 0
                  ) {
                    p2pTransportBytesReceived =
                      summaryCurrentP2P[key].transport.bytesReceived -
                      summaryPreviousP2P[key].transport.bytesReceived;
                  }
                  if (
                    summaryCurrentP2P[key].transport?.packetsSent &&
                    summaryCurrentP2P[key].transport?.packetsSent != 0
                  ) {
                    p2pTransportPacketsSent =
                      summaryCurrentP2P[key].transport.packetsSent -
                      summaryPreviousP2P[key].transport.packetsSent;
                  }
                  if (
                    summaryCurrentP2P[key].transport?.packetsReceived &&
                    summaryCurrentP2P[key].transport?.packetsReceived != 0
                  ) {
                    p2pTransportPacketsReceived =
                      summaryCurrentP2P[key].transport.packetsReceived -
                      summaryPreviousP2P[key].transport.packetsReceived;
                  }

                  if (
                    summaryCurrentP2P[key].transport?.bytesSent &&
                    summaryCurrentP2P[key].transport?.bytesSent != 0
                  ) {
                    p2pTransportBitrateSent =
                      8 *
                      this.calculateRateInSeconds({
                        currentValue:
                          summaryCurrentP2P[key].transport.bytesSent,
                        previousValue:
                          summaryPreviousP2P[key].transport.bytesSent,
                        currentTimestamp:
                          summaryCurrentP2P[key].transport.timestamp,
                        previousTimestamp:
                          summaryPreviousP2P[key].transport.timestamp,
                      });
                  }
                  if (
                    summaryCurrentP2P[key].transport?.bytesReceived &&
                    summaryCurrentP2P[key].transport?.bytesReceived != 0
                  ) {
                    p2pTransportBitrateReceived =
                      8 *
                      this.calculateRateInSeconds({
                        currentValue:
                          summaryCurrentP2P[key].transport.bytesReceived,
                        previousValue:
                          summaryPreviousP2P[key].transport.bytesReceived,
                        currentTimestamp:
                          summaryCurrentP2P[key].transport.timestamp,
                        previousTimestamp:
                          summaryPreviousP2P[key].transport.timestamp,
                      });
                  }
                }

                //</editor-fold>
              } else {
                if (summaryCurrentP2P[key]) {
                  p2pVideoPacketsSent =
                    summaryCurrentP2P[key].video?.packetsSent;
                  p2pVideoPacketsReceived =
                    summaryCurrentP2P[key].video?.packetsReceived;
                  p2pVideoPacketsLost =
                    summaryCurrentP2P[key].video?.packetsLost;
                  p2pVideoBytesSent = summaryCurrentP2P[key].video?.bytesSent;
                  p2pVideoFramesSent = summaryCurrentP2P[key].video?.framesSent;
                  p2pVideoNackCountOutbound =
                    summaryCurrentP2P[key].video?.nackCountOutbound;
                  p2pVideoFirCountOutbound =
                    summaryCurrentP2P[key].video?.firCountOutbound;
                  p2pVideoPliCountOutbound =
                    summaryCurrentP2P[key].video?.pliCountOutbound;
                  p2pVideoQpSumOutbound =
                    summaryCurrentP2P[key].video?.qpSumOutbound;
                  p2pVideoBytesReceived =
                    summaryCurrentP2P[key].video?.bytesReceived;
                  p2pVideoFramesReceived =
                    summaryCurrentP2P[key].video?.framesReceived;
                  p2pVideoFramesDropped =
                    summaryCurrentP2P[key].video?.framesDropped;
                  p2pVideoNackCountInbound =
                    summaryCurrentP2P[key].video?.nackCountInbound;
                  p2pVideoFirCountInbound =
                    summaryCurrentP2P[key].video?.firCountInbound;
                  p2pVideoPliCountInbound =
                    summaryCurrentP2P[key].video?.pliCountInbound;
                  p2pVideoQpSumInbound =
                    summaryCurrentP2P[key].video?.qpSumInbound;

                  p2pAudioBytesSent = summaryCurrentP2P[key].audio?.bytesSent;
                  p2pAudioBytesReceived =
                    summaryCurrentP2P[key].audio?.bytesReceived;
                  p2pAudioPacketsSent =
                    summaryCurrentP2P[key].audio?.packetsSent;
                  p2pAudioPacketsReceived =
                    summaryCurrentP2P[key].audio?.packetsReceived;
                  p2pAudioPacketsLost =
                    summaryCurrentP2P[key].audio?.packetsLost;
                  p2pAudioNackCountInbound =
                    summaryCurrentP2P[key].audio?.nackCountInbound;
                  p2pAudioNackCountOutbound =
                    summaryCurrentP2P[key].audio?.nackCountOutbound;

                  p2pTransportPacketsSent =
                    summaryCurrentP2P[key].transport?.packetsSent;
                  p2pTransportPacketsReceived =
                    summaryCurrentP2P[key].transport?.packetsReceived;
                  p2pTransportBytesSent =
                    summaryCurrentP2P[key].transport?.bytesSent;
                  p2pTransportBytesReceived =
                    summaryCurrentP2P[key].transport?.bytesReceived;
                }
              }
              videoBytesSent += p2pVideoBytesSent;
              videoBytesReceived += p2pVideoBytesReceived;
              videoPacketsSent += p2pVideoPacketsSent;
              videoPacketsLost += p2pVideoPacketsLost;
              videoPacketsReceived += p2pVideoPacketsReceived;
              videoNackCountInbound += p2pVideoNackCountInbound;
              videoNackCountOutbound += p2pVideoNackCountOutbound;
              videoFirCountInbound += p2pVideoFirCountInbound;
              videoFirCountOutbound += p2pVideoFirCountOutbound;
              videoPliCountInbound += p2pVideoPliCountInbound;
              videoPliCountOutbound += p2pVideoPliCountOutbound;
              videoQpSumInbound += p2pVideoQpSumInbound;
              videoQpSumOutbound += p2pVideoQpSumOutbound;
              videoFramesSent += p2pVideoFramesSent;
              videoFramesReceived += p2pVideoFramesReceived;
              videoFramesDropped += p2pVideoFramesDropped;
              videoFramesEncoded += p2pVideoFramesEncoded;
              videoFramesDecoded += p2pVideoFramesDecoded;
              videoBitrateSent += p2pVideoBitrateSent / 1024;

              videoBitrateReceived += p2pVideoBitrateReceived / 1024;
              videoQualityLimitationBandwidthBandwidth +=
                p2pVideoQualityLimitationBandwidth;
              videoQualityLimitationBandwidthCpu +=
                p2pVideoQualityLimitationCpu;
              videoQualityLimitationBandwidthOther +=
                p2pVideoQualityLimitationOther;
              // if (videoBytesSent < 0) {
              //   videoBytesSent = -10000;
              // }
              // if (videoBytesReceived < 0) {
              //   videoBytesReceived = -10000;
              // }
              // if (videoPacketsSent < 0) {
              //   videoPacketsSent = -10000;
              // }
              // if (videoPacketsReceived < 0) {
              //   videoPacketsReceived = -10000;
              // }
              // if (videoPacketsLost < 0) {
              //   videoPacketsLost = -10000;
              // }
              // if (videoFramesSent < 0) {
              //   videoFramesSent = -10000;
              // }
              // if (videoFramesReceived < 0) {
              //   videoFramesReceived = -10000;
              // }
              // if (videoFramesEncoded < 0) {
              //   videoFramesEncoded = -10000;
              // }
              // if (videoFramesDecoded < 0) {
              //   videoFramesDecoded = -10000;
              // }
              result.p2pVideoFramesSent.push(p2pVideoFramesSent);
              result.p2pVideoFramesReceived.push(p2pVideoFramesReceived);
              result.p2pVideoFramesDropped.push(p2pVideoFramesDropped);
              result.p2pVideoFramesEncoded.push(p2pVideoFramesEncoded);
              result.p2pVideoFramesDecoded.push(p2pVideoFramesDecoded);

              result.p2pVideoQpSumOutbound.push(p2pVideoQpSumOutbound);
              result.p2pVideoQpSumInbound.push(p2pVideoQpSumInbound);
              result.avgVideoBitrateSent.push(p2pVideoBitrateSent / 1024);
              result.avgVideoBitrateReceived.push(
                p2pVideoBitrateReceived / 1024,
              );
              result.avgAudioBitrateSent.push(p2pAudioBitrateSent / 1024);
              result.avgAudioBitrateReceived.push(
                p2pAudioBitrateReceived / 1024,
              );

              let qpInbound = 0;
              let qpOutbound = 0;

              if (
                summaryCurrentP2P[key].video?.framesDecoded &&
                summaryCurrentP2P[key].video?.framesDecoded != 0 &&
                summaryCurrentP2P[key].video?.qpSumInbound
              ) {
                qpInbound =
                  summaryCurrentP2P[key].video?.qpSumInbound /
                  summaryCurrentP2P[key].video?.framesDecoded;
              }
              if (
                summaryCurrentP2P[key].video?.framesEncoded &&
                summaryCurrentP2P[key].video?.framesEncoded != 0 &&
                summaryCurrentP2P[key].video?.qpSumOutbound
              ) {
                qpOutbound =
                  summaryCurrentP2P[key].video?.qpSumOutbound /
                  summaryCurrentP2P[key].video?.framesEncoded;
              }

              result.p2pVideoQpOutbound.push(qpOutbound);
              result.p2pVideoQpInbound.push(qpInbound);
              if (
                result.p2pVideoLocalResolution[
                  summaryCurrentP2P[key].video.localFrameResolution
                ]
              ) {
                result.p2pVideoLocalResolution[
                  summaryCurrentP2P[key].video.localFrameResolution
                ]++;
              } else {
                result.p2pVideoLocalResolution[
                  summaryCurrentP2P[key].video.localFrameResolution
                ] = 1;
              }
              if (
                result.p2pVideoRemoteResolution[
                  summaryCurrentP2P[key].video.remoteFrameResolution
                ]
              ) {
                result.p2pVideoRemoteResolution[
                  summaryCurrentP2P[key].video.remoteFrameResolution
                ]++;
              } else {
                result.p2pVideoRemoteResolution[
                  summaryCurrentP2P[key].video.remoteFrameResolution
                ] = 1;
              }

              audioBytesSent += p2pAudioBitrateSent;
              audioBytesReceived += p2pAudioBytesReceived;
              audioPacketsSent += p2pAudioPacketsSent;
              audioPacketsLost += p2pAudioPacketsLost;
              audioPacketsReceived += p2pAudioPacketsReceived;
              audioNackCountInbound += p2pAudioNackCountInbound;
              audioNackCountOutbound += p2pAudioNackCountOutbound;
              audioBitrateSent += p2pAudioBitrateSent / 1024;
              audioBitrateReceived += p2pAudioBitrateReceived / 1024;

              totalBitrateReceived +=
                (p2pVideoBitrateReceived + p2pAudioBitrateReceived) / 1024;
              totalBitrateSent +=
                (p2pVideoBitrateSent + p2pAudioBitrateSent) / 1024;
              totalBytesSent += p2pVideoBytesSent + p2pAudioBytesSent;
              totalBytesReceived +=
                p2pVideoBytesReceived + p2pAudioBytesReceived;
              totalPacketsSent += p2pVideoPacketsSent + p2pAudioPacketsSent;
              totalPacketsReceived +=
                p2pVideoPacketsReceived + p2pAudioPacketsReceived;
              totalPacketsLost += p2pVideoPacketsLost + p2pAudioPacketsLost;

              transportBitrateSent += p2pTransportBitrateSent / 1024;
              transportBitrateReceived += p2pTransportBitrateReceived / 1024;
              transportBytesSent += p2pTransportBytesSent;
              transportBytesReceived += p2pTransportBytesReceived;
              transportPacketsSent += p2pTransportPacketsSent;
              transportPacketsReceived += p2pTransportPacketsReceived;

              result.p2pVideoQualityLimitations.push({
                bandwidth:
                  summaryCurrentP2P[key].video.qualityLimitationBandwidth,
                cpu: summaryCurrentP2P[key].video.qualityLimitationCpu,
                other: summaryCurrentP2P[key].video.qualityLimitationOther,
              });
              result.p2pVideoLocalResolutions.push(
                summaryCurrentP2P[key].video.localResolutions,
              );
              result.p2pVideoRemoteResolutions.push(
                summaryCurrentP2P[key].video.remoteResolutions,
              );
              result.p2pVideoJitter.push(summaryCurrentP2P[key].video.jitter);
              result.p2pAudioJitter.push(summaryCurrentP2P[key].audio.jitter);
            }
            const labelP2P = Math.floor(
              (currentTimestamp - firstTimestamp) / 1000,
            );

            summary.labelsP2P.push(labelP2P);

            summary.dataVideoBitrateSentP2P.push(videoBitrateSent.toFixed(2));
            summary.dataVideoBitrateReceivedP2P.push(
              videoBitrateReceived.toFixed(2),
            );
            summary.dataVideoBytesSentP2P.push(videoBytesSent);
            summary.dataVideoBytesReceivedP2P.push(videoBytesReceived);
            summary.dataVideoPacketsSentP2P.push(videoPacketsSent);
            summary.dataVideoPacketsLostP2P.push(videoPacketsLost);
            summary.dataVideoPacketsReceivedP2P.push(videoPacketsReceived);
            summary.dataVideoNackCountInboundP2P.push(videoNackCountInbound);
            summary.dataVideoNackCountOutboundP2P.push(videoNackCountOutbound);
            summary.dataVideoFirCountInboundP2P.push(videoFirCountInbound);
            summary.dataVideoFirCountOutboundP2P.push(videoFirCountOutbound);
            summary.dataVideoPliCountInboundP2P.push(videoPliCountInbound);
            summary.dataVideoPliCountOutboundP2P.push(videoPliCountOutbound);
            summary.dataVideoQpSumInboundP2P.push(videoQpSumInbound);
            summary.dataVideoQpSumOutboundP2P.push(videoQpSumOutbound);
            summary.dataVideoQualityLimitationBandwidth.push(
              videoQualityLimitationBandwidthBandwidth,
            );
            summary.dataVideoQualityLimitationCpu.push(
              videoQualityLimitationBandwidthCpu,
            );
            summary.dataVideoQualityLimitationOther.push(
              videoQualityLimitationBandwidthOther,
            );
            for (const key in result.p2pVideoLocalResolution) {
              if (summary.p2pLocalResolutions[key]) {
                if (summary.p2pLocalResolutions[key].length < resume) {
                  const tempArray = new Array(
                    resume - summary.p2pLocalResolutions[key].length,
                  );
                  tempArray.fill(0);
                  summary.p2pLocalResolutions[key] =
                    summary.p2pLocalResolutions[key].concat(tempArray);
                }
                summary.p2pLocalResolutions[key].push(
                  result.p2pVideoLocalResolution[key],
                );
              } else {
                const tempArray = new Array(resume);
                tempArray.fill(0);
                summary.p2pLocalResolutions[key] = [].concat(tempArray);
                summary.p2pLocalResolutions[key].push(
                  result.p2pVideoLocalResolution[key],
                );
              }
            }

            for (const key in result.p2pVideoRemoteResolution) {
              if (summary.p2pRemoteResolutions[key]) {
                if (summary.p2pRemoteResolutions[key].length < resume) {
                  const tempArray = new Array(
                    resume - summary.p2pRemoteResolutions[key].length,
                  );
                  tempArray.fill(0);
                  summary.p2pRemoteResolutions[key] =
                    summary.p2pRemoteResolutions[key].concat(tempArray);
                }
                summary.p2pRemoteResolutions[key].push(
                  result.p2pVideoRemoteResolution[key],
                );
              } else {
                const tempArray = new Array(resume);
                tempArray.fill(0);
                summary.p2pRemoteResolutions[key] = [].concat(tempArray);
                summary.p2pRemoteResolutions[key].push(
                  result.p2pVideoRemoteResolution[key],
                );
              }
            }

            summary.dataVideoLocalResolutions.push(
              result.p2pVideoLocalResolution,
            );
            summary.dataVideoRemoteResolutions.push(
              result.p2pVideoRemoteResolution,
            );
            // return summary;
            let avgFramesSent = 0;
            const filteredFramesSent = result.p2pVideoFramesSent.filter(
              (item) => item !== 0,
            );
            if (filteredFramesSent.length > 1) {
              const sumFramesSent = filteredFramesSent.reduce((a, b) => a + b);
              avgFramesSent = sumFramesSent / filteredFramesSent.length;
            }

            let avgFramesRecv = 0;
            const filteredFramesRecv = result.p2pVideoFramesReceived.filter(
              (item) => item !== 0,
            );
            if (filteredFramesRecv.length > 1) {
              const sumFramesRecv = filteredFramesRecv.reduce((a, b) => a + b);
              avgFramesRecv = sumFramesRecv / filteredFramesRecv.length;
            }

            let avgFramesDropped = 0;
            const filteredFramesDropped = result.p2pVideoFramesDropped.filter(
              (item) => item !== 0,
            );
            if (filteredFramesDropped.length > 1) {
              const sumFramesDropped = filteredFramesDropped.reduce(
                (a, b) => a + b,
              );
              avgFramesDropped =
                sumFramesDropped / filteredFramesDropped.length;
            }

            let avgFramesEncoded = 0;
            const filteredFramesEncoded = result.p2pVideoFramesEncoded.filter(
              (item) => item !== 0,
            );
            if (filteredFramesEncoded.length > 1) {
              const sumFramesEncoded = filteredFramesEncoded.reduce(
                (a, b) => a + b,
              );
              avgFramesEncoded =
                sumFramesEncoded / filteredFramesEncoded.length;
            }

            let avgFramesDecoded = 0;
            const filteredFramesDecoded = result.p2pVideoFramesDecoded.filter(
              (item) => item !== 0,
            );
            if (filteredFramesDecoded.length > 1) {
              const sumFramesDecoded = filteredFramesDecoded.reduce(
                (a, b) => a + b,
              );
              avgFramesDecoded =
                sumFramesDecoded / filteredFramesDecoded.length;
            }
            let avgVideoJitter = 0;
            const filteredVideoJitter = result.p2pVideoJitter.filter(
              (item) => item !== 0,
            );
            if (filteredVideoJitter.length > 1) {
              const sumVideoJitter = filteredVideoJitter.reduce(
                (a, b) => a + b,
              );
              avgVideoJitter = sumVideoJitter;
            }
            let avgVideoQPIn = 0;
            const filteredVideoQPIn = result.p2pVideoQpInbound.filter(
              (item) => item !== 0,
            );
            if (filteredVideoQPIn.length > 1) {
              const sumVideoQPIn = filteredVideoQPIn.reduce((a, b) => a + b);
              avgVideoQPIn = sumVideoQPIn;
            }
            let avgVideoQPOut = 0;
            const filteredVideoQPOut = result.p2pVideoQpOutbound.filter(
              (item) => item !== 0,
            );
            if (filteredVideoQPOut.length > 1) {
              const sumVideoQPOut = filteredVideoQPOut.reduce((a, b) => a + b);
              avgVideoQPOut = sumVideoQPOut;
            }
            const p2pAvgVideoBitrateSent =
              MonitoringService.getAvgNonZeroValueFromArray(
                result.avgVideoBitrateSent,
              );
            const p2pAvgVideoBitrateReceived =
              MonitoringService.getAvgNonZeroValueFromArray(
                result.avgVideoBitrateReceived,
              );
            const p2pAvgAudioBitrateSent =
              MonitoringService.getAvgNonZeroValueFromArray(
                result.avgAudioBitrateSent,
              );
            const p2pAvgAudioBitrateReceived =
              MonitoringService.getAvgNonZeroValueFromArray(
                result.avgAudioBitrateReceived,
              );
            summary.dataVideoAvgBitrateSentP2P.push(p2pAvgVideoBitrateSent.avg);
            summary.dataVideoAvgBitrateReceivedP2P.push(
              p2pAvgVideoBitrateReceived.avg,
            );
            summary.dataAudioAvgBitrateSentP2P.push(p2pAvgAudioBitrateSent.avg);
            summary.dataAudioAvgBitrateReceivedP2P.push(
              p2pAvgAudioBitrateReceived.avg,
            );

            summary.dataVideoAvgFramesSentP2P.push(avgFramesSent);
            summary.dataVideoAvgFramesReceivedP2P.push(avgFramesRecv);

            summary.dataVideoAvgFramesDroppedP2P.push(avgFramesDropped);
            summary.dataVideoAvgFramesEncodedP2P.push(avgFramesEncoded);
            summary.dataVideoAvgFramesDecodedP2P.push(avgFramesDecoded);
            summary.dataVideoFramesSentP2P.push(videoFramesSent);
            summary.dataVideoFramesReceivedP2P.push(videoFramesReceived);
            summary.dataVideoFramesDroppedP2P.push(videoFramesDropped);
            summary.dataVideoFramesEncodedP2P.push(videoFramesEncoded);
            summary.dataVideoFramesDecodedP2P.push(videoFramesDecoded);
            summary.dataVideoAvgJitterP2P.push(avgVideoJitter);
            summary.dataVideoAvgQpInboundP2P.push(avgVideoQPIn);
            summary.dataVideoAvgQpOutboundP2P.push(avgVideoQPOut);

            summary.dataAudioBytesSentP2P.push(audioBytesSent);
            summary.dataAudioBytesReceivedP2P.push(audioBytesReceived);
            summary.dataAudioPacketsSentP2P.push(audioPacketsSent);
            summary.dataAudioPacketsLostP2P.push(audioPacketsLost);
            summary.dataAudioPacketsReceivedP2P.push(audioPacketsReceived);
            summary.dataAudioNackCountInboundP2P.push(audioNackCountInbound);
            summary.dataAudioNackCountOutboundP2P.push(audioNackCountOutbound);
            summary.dataAudioBitrateSentP2P.push(audioBitrateSent.toFixed(2));
            summary.dataAudioBitrateReceivedP2P.push(
              audioBitrateReceived.toFixed(2),
            );
            let avgAudioJitter = 0;
            const filteredAudioJitter = result.p2pAudioJitter.filter(
              (item) => item !== 0,
            );
            if (filteredAudioJitter.length > 1) {
              avgAudioJitter = filteredAudioJitter.reduce((a, b) => a + b);
            }
            summary.dataAudioAvgJitterP2P.push(avgAudioJitter);
            summary.dataTransportBitrateSentP2P.push(
              transportBitrateSent.toFixed(2),
            );
            summary.dataTransportBitrateReceivedP2P.push(
              transportBitrateReceived.toFixed(2),
            );
            summary.dataTransportBytesSentP2P.push(transportBytesSent);
            summary.dataTransportBytesReceivedP2P.push(transportBytesReceived);
            summary.dataTransportPacketsSentP2P.push(transportPacketsSent);
            summary.dataTransportPacketsReceivedP2P.push(
              transportPacketsReceived,
            );

            summary.dataTotalConnections.push(
              currentSnapshot.p2pSnapshots.size,
            );
            summaryCurrentConsumer.transport =
              previousSnapshot.sfuSnapshots.consumer.transport;

            summaryPreviousConsumer.transport =
              currentSnapshot.sfuSnapshots.consumer.transport;
            //</editor-fold>

            const previousConsumerMedia =
              previousSnapshot.sfuSnapshots.consumer.media;
            const currentConsumerMedia =
              currentSnapshot.sfuSnapshots.consumer.media;

            for (const key in currentConsumerMedia) {
              const report = currentConsumerMedia[key];
              if (report.video) {
                summaryCurrentConsumer[key] = {
                  ...summaryCurrentConsumer[key],
                  video: {
                    ...this.templateP2P.video,
                    timestamp: report.video.timestamp,
                  },
                };
              }
            }

            let sfuAudioBytesReceived = 0;
            let sfuAudioPacketsReceivedInbound = 0;
            let sfuAudioPacketsLostInbound = 0;
            const sfuAudioJitterInboundAvg = [];

            let sfuVideoBytesReceived = 0;
            let sfuVideoNackCountInbound = 0;
            let sfuVideoPacketsReceivedInbound = 0;
            let sfuVideoPacketsLostInbound = 0;
            let sfuVideoFramesReceived = 0;
            let sfuVideoFramesDecoded = 0;
            let sfuVideoFramesDropped = 0;
            let sfuVideoFirCountInbound = 0;
            let sfuVideoPliCountInbound = 0;

            const sfuVideoFramesReceivedAvg = [];
            const sfuVideoFramesDecodedAvg = [];
            const sfuVideoFramesDroppedAvg = [];
            const sfuVideoJitterInboundAvg = [];

            const sfuVideoBitrateSentAvg = [];
            const sfuVideoBitrateReceivedAvg = [];
            const sfuAudioBitrateSentAvg = [];
            const sfuAudioBitrateReceivedAvg = [];

            for (const key in currentConsumerMedia) {
              const currentReport = currentConsumerMedia[key];
              const previousReport = previousConsumerMedia[key];
              let bitrateReceived = 0;
              let remoteResolution = 'none';
              if (
                currentReport.video?.remoteFrameWidth &&
                currentReport.video?.remoteFrameWidth != 0
              ) {
                remoteResolution = `${currentReport.video.remoteFrameWidth}x${currentReport.video.remoteFrameHeight}`;
              }
              if (sfuVideoRemoteResolution[remoteResolution]) {
                sfuVideoRemoteResolution[remoteResolution]++;
              } else {
                sfuVideoRemoteResolution[remoteResolution] = 1;
              }
              sfuVideoFramesDroppedAvg.push(
                currentReport.video?.framesDropped
                  ? currentReport.video.framesDropped
                  : 0,
              );
              sfuVideoFramesReceivedAvg.push(
                currentReport.video?.framesReceived
                  ? currentReport.video.framesReceived
                  : 0,
              );
              sfuVideoFramesDecodedAvg.push(
                currentReport.video?.framesDecoded
                  ? currentReport.video.framesDecoded
                  : 0,
              );
              sfuVideoJitterInboundAvg.push(
                currentReport.video?.jitter ? currentReport.video.jitter : 0,
              );
              sfuAudioJitterInboundAvg.push(
                currentReport.audio?.jitter ? currentReport.audio.jitter : 0,
              );
              if (previousReport) {
                if (currentReport.video && previousReport.video) {
                  const currentBytesReceived = currentReport.video
                    ?.bytesReceived
                    ? currentReport.video.bytesReceived
                    : 0;
                  const previousBytesReceived = previousConsumerMedia[key].video
                    ?.bytesReceived
                    ? previousConsumerMedia[key].video.bytesReceived
                    : 0;

                  bitrateReceived =
                    8 *
                    this.calculateRateInSeconds({
                      previousValue: previousBytesReceived,
                      previousTimestamp: previousTimestamp,
                      currentTimestamp: currentTimestamp,
                      currentValue: currentBytesReceived,
                    });

                  sfuVideoBytesReceived +=
                    currentBytesReceived - previousBytesReceived;
                  sfuVideoPacketsReceivedInbound +=
                    (currentReport.video?.packetsReceived
                      ? currentReport.video.packetsReceived
                      : 0) -
                    (previousConsumerMedia[key].video?.packetsReceived
                      ? previousConsumerMedia[key].video.packetsReceived
                      : 0);
                  sfuVideoPacketsLostInbound +=
                    (currentReport.video?.packetsLost
                      ? currentReport.video.packetsLost
                      : 0) -
                    (previousConsumerMedia[key].video?.packetsLost
                      ? previousConsumerMedia[key].video.packetsLost
                      : 0);

                  sfuVideoFramesReceived +=
                    (currentReport.video?.framesReceived
                      ? currentReport.video.framesReceived
                      : 0) -
                    (previousConsumerMedia[key].video?.framesReceived
                      ? previousConsumerMedia[key].video.framesReceived
                      : 0);
                  sfuVideoFramesDropped +=
                    (currentReport.video?.framesDropped
                      ? currentReport.video.framesDropped
                      : 0) -
                    (previousConsumerMedia[key].video?.framesDropped
                      ? previousConsumerMedia[key].video.framesDropped
                      : 0);
                  sfuVideoFramesDecoded +=
                    (currentReport.video?.framesDecoded
                      ? currentReport.video.framesDecoded
                      : 0) -
                    (previousConsumerMedia[key].video?.framesDecoded
                      ? previousConsumerMedia[key].video.framesDecoded
                      : 0);

                  sfuVideoFirCountInbound +=
                    (currentReport.video?.firCountInbound
                      ? currentReport.video.firCountInbound
                      : 0) -
                    (previousConsumerMedia[key].video?.firCountInbound
                      ? previousConsumerMedia[key].video.firCountInbound
                      : 0);
                  sfuVideoPliCountInbound +=
                    (currentReport.video?.pliCountInbound
                      ? currentReport.video.pliCountInbound
                      : 0) -
                    (previousConsumerMedia[key].video?.pliCountInbound
                      ? previousConsumerMedia[key].video.pliCountInbound
                      : 0);
                  sfuVideoNackCountInbound +=
                    (currentReport.video?.nackCountInbound
                      ? currentReport.video.nackCountInbound
                      : 0) -
                    (previousConsumerMedia[key].video?.nackCountInbound
                      ? previousConsumerMedia[key].video.nackCountInbound
                      : 0);
                }

                if (currentReport.audio) {
                  sfuAudioBytesReceived +=
                    (currentReport.audio?.bytesReceived
                      ? currentReport.audio.bytesReceived
                      : 0) -
                    (previousConsumerMedia[key].audio?.bytesReceived
                      ? previousConsumerMedia[key].audio.bytesReceived
                      : 0);
                  sfuAudioPacketsReceivedInbound +=
                    (currentReport.audio?.packetsReceived
                      ? currentReport.audio.packetsReceived
                      : 0) -
                    (previousConsumerMedia[key].audio?.packetsReceived
                      ? previousConsumerMedia[key].audio.packetsReceived
                      : 0);
                  sfuAudioPacketsLostInbound +=
                    (currentReport.audio?.packetsLost
                      ? currentReport.audio.packetsLost
                      : 0) -
                    (previousConsumerMedia[key].audio?.packetsLost
                      ? previousConsumerMedia[key].audio.packetsLost
                      : 0);
                }
              }
              sfuVideoBitrateReceivedAvg.push(bitrateReceived / 1024);
            }
            for (const key in sfuVideoRemoteResolution) {
              if (summary.sfuRemoteResolutions[key]) {
                if (summary.sfuRemoteResolutions[key].length < resume) {
                  const tempArray = new Array(
                    resume - summary.sfuRemoteResolutions[key].length,
                  );
                  tempArray.fill(0);
                  summary.sfuRemoteResolutions[key] =
                    summary.sfuRemoteResolutions[key].concat(tempArray);
                }
                summary.sfuRemoteResolutions[key].push(
                  sfuVideoRemoteResolution[key],
                );
              } else {
                const tempArray = new Array(resume);
                tempArray.fill(0);
                summary.sfuRemoteResolutions[key] = [].concat(tempArray);
                summary.sfuRemoteResolutions[key].push(
                  sfuVideoRemoteResolution[key],
                );
              }
            }
            resume++;
            summary.dataAudioBytesReceivedSFU.push(sfuAudioBytesReceived);
            summary.dataAudioPacketsReceivedSFU.push(
              sfuAudioPacketsReceivedInbound,
            );
            summary.dataAudioPacketsLostSFU.push(sfuAudioPacketsLostInbound);

            summary.dataVideoBytesReceivedSFU.push(sfuVideoBytesReceived);
            summary.dataVideoPacketsReceivedSFU.push(
              sfuVideoPacketsReceivedInbound,
            );
            summary.dataVideoPacketsLostSFU.push(sfuVideoPacketsLostInbound);
            summary.dataVideoFramesReceivedSFU.push(sfuVideoFramesReceived);
            summary.dataVideoFramesDroppedSFU.push(sfuVideoFramesDropped);
            summary.dataVideoFramesDecodedSFU.push(sfuVideoFramesDecoded);

            summary.dataVideoNackCountInboundSFU.push(sfuVideoNackCountInbound);
            summary.dataVideoFirCountInboundSFU.push(sfuVideoFirCountInbound);
            summary.dataVideoPliCountInboundSFU.push(sfuVideoPliCountInbound);
            summary.dataVideoAvgFramesReceivedSFU.push(
              MonitoringService.getAvgNonZeroValueFromArray(
                sfuVideoFramesReceivedAvg,
              ).avg,
            );
            summary.dataVideoAvgFramesDroppedSFU.push(
              MonitoringService.getAvgNonZeroValueFromArray(
                sfuVideoFramesDroppedAvg,
              ).avg,
            );
            summary.dataVideoAvgFramesDecodedSFU.push(
              MonitoringService.getAvgNonZeroValueFromArray(
                sfuVideoFramesDecodedAvg,
              ).avg,
            );
            summary.dataVideoAvgJitterInboundSFU.push(
              MonitoringService.getAvgNonZeroValueFromArray(
                sfuVideoJitterInboundAvg,
              ).avg,
            );
            summary.dataAudioAvgJitterInboundSFU.push(
              MonitoringService.getAvgNonZeroValueFromArray(
                sfuAudioJitterInboundAvg,
              ).avg,
            );

            const sfuAvgVideoBitrateReceived =
              MonitoringService.getAvgNonZeroValueFromArray(
                sfuVideoBitrateReceivedAvg,
              );
            const sfuAvgAudioBitrateReceived =
              MonitoringService.getAvgNonZeroValueFromArray(
                sfuAudioBitrateReceivedAvg,
              );

            summary.dataVideoAvgBitrateReceivedSFU.push(
              sfuAvgVideoBitrateReceived.avg,
            );
            summary.dataAudioAvgBitrateReceivedSFU.push(
              sfuAvgAudioBitrateReceived.avg,
            );

            const consumerVideoBitrateReceived =
              8 *
              this.calculateRateInSeconds({
                currentValue: summaryCurrentConsumer.video.bytesReceived,
                previousValue: summaryPreviousConsumer.video.bytesReceived,
                currentTimestamp: summaryCurrentConsumer.video.timestamp,
                previousTimestamp: summaryPreviousConsumer.video.timestamp,
              });

            const consumerAudioBitrateReceived =
              8 *
              this.calculateRateInSeconds({
                currentValue: summaryCurrentConsumer.audio.bytesReceived,
                previousValue: summaryPreviousConsumer.audio.bytesReceived,
                currentTimestamp: summaryCurrentConsumer.audio.timestamp,
                previousTimestamp: summaryPreviousConsumer.audio.timestamp,
              });

            const producerVideoBitrate =
              previousSnapshot.sfuSnapshots.producer.video.bitrate;
            const producerAudioBitrate =
              previousSnapshot.sfuSnapshots.producer.audio.bitrate;

            const producerVideoBytesSent =
              (currentSnapshot.sfuSnapshots.producer.video.byteCount
                ? currentSnapshot.sfuSnapshots.producer.video.byteCount
                : 0) -
              (previousSnapshot.sfuSnapshots.producer.video.byteCount
                ? previousSnapshot.sfuSnapshots.producer.video.byteCount
                : 0);
            const producerVideoPacketsSent =
              (currentSnapshot.sfuSnapshots.producer.video.packetCount
                ? currentSnapshot.sfuSnapshots.producer.video.packetCount
                : 0) -
              (previousSnapshot.sfuSnapshots.producer.video.packetCount
                ? previousSnapshot.sfuSnapshots.producer.video.packetCount
                : 0);
            const producerVideoPacketsLost =
              (currentSnapshot.sfuSnapshots.producer.video.packetsLost
                ? currentSnapshot.sfuSnapshots.producer.video.packetsLost
                : 0) -
              (previousSnapshot.sfuSnapshots.producer.video.packetsLost
                ? previousSnapshot.sfuSnapshots.producer.video.packetsLost
                : 0);
            const producerAudioBytesSent =
              currentSnapshot.sfuSnapshots.producer.audio.byteCount -
              previousSnapshot.sfuSnapshots.producer.audio.byteCount;
            const producerAudioPacketsSent =
              (currentSnapshot.sfuSnapshots.producer.audio.packetCount
                ? currentSnapshot.sfuSnapshots.producer.audio.packetCount
                : 0) -
              (previousSnapshot.sfuSnapshots.producer.audio.packetCount
                ? previousSnapshot.sfuSnapshots.producer.audio.packetCount
                : 0);
            const producerAudioPacketsLost =
              currentSnapshot.sfuSnapshots.producer.audio.packetsLost -
              previousSnapshot.sfuSnapshots.producer.audio.packetsLost;
            let totalAvgVideoRecv = 0;
            if (
              sfuAvgVideoBitrateReceived.sample +
                p2pAvgVideoBitrateReceived.sample !=
              0
            ) {
              totalAvgVideoRecv =
                (p2pAvgVideoBitrateReceived.avg *
                  p2pAvgVideoBitrateReceived.sample +
                  sfuAvgVideoBitrateReceived.avg *
                    sfuAvgVideoBitrateReceived.sample) /
                (sfuAvgVideoBitrateReceived.sample +
                  p2pAvgVideoBitrateReceived.sample);
            }
            let totalAvgAudioRecv = 0;
            if (
              sfuAvgAudioBitrateReceived.sample +
                p2pAvgAudioBitrateReceived.sample !=
              0
            ) {
              totalAvgAudioRecv =
                (p2pAvgAudioBitrateReceived.avg *
                  p2pAvgAudioBitrateReceived.sample +
                  sfuAvgAudioBitrateReceived.avg *
                    sfuAvgAudioBitrateReceived.sample) /
                (sfuAvgAudioBitrateReceived.sample +
                  p2pAvgAudioBitrateReceived.sample);
            }

            summary.dataTotalAvgVideoBitrateReceived.push(totalAvgVideoRecv);
            summary.dataTotalAvgAudioBitrateReceived.push(totalAvgAudioRecv);

            const videoBitrateSentSfu = producerVideoBitrate / 1024;
            const audioBitrateSentSfu = producerAudioBitrate / 1024;
            let totalAvgVideoBitrateSent = 0;
            let totalAvgAudioBitrateSent = 0;
            if (videoBitrateSentSfu != 0) {
              totalAvgVideoBitrateSent =
                (p2pAvgVideoBitrateSent.avg * p2pAvgVideoBitrateSent.sample +
                  videoBitrateSentSfu) /
                (p2pAvgVideoBitrateSent.sample + 1);
            } else {
              totalAvgVideoBitrateSent = p2pAvgVideoBitrateSent.avg;
            }
            if (audioBitrateSentSfu != 0) {
              totalAvgAudioBitrateSent =
                (p2pAvgAudioBitrateSent.avg * p2pAvgAudioBitrateSent.sample +
                  audioBitrateSentSfu) /
                (p2pAvgAudioBitrateSent.sample + 1);
            } else {
              totalAvgAudioBitrateSent = p2pAvgAudioBitrateSent.avg;
            }
            summary.dataTotalAvgVideoBitrateSent.push(totalAvgVideoBitrateSent);
            summary.dataTotalAvgAudioBitrateSent.push(totalAvgAudioBitrateSent);
            summary.dataVideoBitrateSentSFU.push(videoBitrateSentSfu);
            summary.dataVideoBytesSentSFU.push(producerVideoBytesSent);
            summary.dataVideoBitrateReceivedSFU.push(
              consumerVideoBitrateReceived,
            );
            summary.dataVideoJitterOutboundSFU.push(
              currentSnapshot.sfuSnapshots.producer.video.jitter,
            );
            summary.dataVideoPacketsSentSFU.push(producerVideoPacketsSent);
            summary.dataVideoPacketsLostOutboundSFU.push(
              producerVideoPacketsLost,
            );
            summary.dataVideoNackCountOutboundSFU.push(
              (currentSnapshot.sfuSnapshots.producer.video.nackCount
                ? currentSnapshot.sfuSnapshots.producer.video.nackCount
                : 0) -
                (previousSnapshot.sfuSnapshots.producer.video.nackCount
                  ? previousSnapshot.sfuSnapshots.producer.video.nackCount
                  : 0),
            );
            summary.dataVideoFirCountOutboundSFU.push(
              (currentSnapshot.sfuSnapshots.producer.video.firCount
                ? currentSnapshot.sfuSnapshots.producer.video.firCount
                : 0) -
                (previousSnapshot.sfuSnapshots.producer.video.firCount
                  ? previousSnapshot.sfuSnapshots.producer.video.firCount
                  : 0),
            );
            summary.dataVideoPliCountOutboundSFU.push(
              (currentSnapshot.sfuSnapshots.producer.video.pliCount
                ? currentSnapshot.sfuSnapshots.producer.video.pliCount
                : 0) -
                (previousSnapshot.sfuSnapshots.producer.video.pliCount
                  ? previousSnapshot.sfuSnapshots.producer.video.pliCount
                  : 0),
            );

            summary.dataAudioJitterOutboundSFU.push(
              currentSnapshot.sfuSnapshots.producer.audio.jitter,
            );
            summary.dataAudioBitrateSentSFU.push(producerAudioBitrate);
            summary.dataAudioBytesSentSFU.push(producerAudioBytesSent);
            summary.dataAudioBitrateReceivedSFU.push(
              consumerAudioBitrateReceived,
            );
            summary.dataAudioPacketsSentSFU.push(producerAudioPacketsSent);
            summary.dataAudioPacketsLostOutboundSFU.push(
              producerAudioPacketsLost,
            );
            const producerTransportBitrateSent =
              (8 *
                this.calculateRateInSeconds({
                  currentValue:
                    currentSnapshot.sfuSnapshots.producer.transport.bytesSent,
                  previousValue:
                    previousSnapshot.sfuSnapshots.producer.transport.bytesSent,
                  currentTimestamp:
                    currentSnapshot.sfuSnapshots.producer.transport.timestamp,
                  previousTimestamp:
                    previousSnapshot.sfuSnapshots.producer.transport.timestamp,
                })) /
              1024;
            const producerTransportBitrateReceived =
              8 *
              this.calculateRateInSeconds({
                previousValue:
                  previousSnapshot.sfuSnapshots.producer.transport
                    .bytesReceived,
                currentValue:
                  currentSnapshot.sfuSnapshots.producer.transport.bytesReceived,
                previousTimestamp:
                  previousSnapshot.sfuSnapshots.producer.transport.timestamp,
                currentTimestamp:
                  currentSnapshot.sfuSnapshots.producer.transport.timestamp,
              });

            const consumerTransportBitrateSent =
              (8 *
                this.calculateRateInSeconds({
                  currentValue:
                    currentSnapshot.sfuSnapshots.consumer.transport.bytesSent,
                  currentTimestamp:
                    currentSnapshot.sfuSnapshots.consumer.transport.timestamp,
                  previousTimestamp:
                    previousSnapshot.sfuSnapshots.consumer.transport.timestamp,
                  previousValue:
                    previousSnapshot.sfuSnapshots.consumer.transport.bytesSent,
                })) /
              1024;
            const consumerTransportBitrateReceived =
              (8 *
                this.calculateRateInSeconds({
                  currentValue:
                    currentSnapshot.sfuSnapshots.consumer.transport
                      .bytesReceived,
                  currentTimestamp:
                    currentSnapshot.sfuSnapshots.consumer.transport.timestamp,
                  previousTimestamp:
                    previousSnapshot.sfuSnapshots.consumer.transport.timestamp,
                  previousValue:
                    previousSnapshot.sfuSnapshots.consumer.transport
                      .bytesReceived,
                })) /
              1024;

            const consumerTransportPacketsSent =
              currentSnapshot.sfuSnapshots.consumer.transport.packetsSent -
              previousSnapshot.sfuSnapshots.consumer.transport.packetsSent;
            const consumerTransportPacketsReceived =
              currentSnapshot.sfuSnapshots.consumer.transport.packetsReceived -
              previousSnapshot.sfuSnapshots.consumer.transport.packetsReceived;
            const producerTransportPacketsSent =
              currentSnapshot.sfuSnapshots.producer.transport.packetsSent -
              previousSnapshot.sfuSnapshots.producer.transport.packetsSent;
            const producerTransportPacketsReceived =
              currentSnapshot.sfuSnapshots.producer.transport.packetsSent -
              previousSnapshot.sfuSnapshots.producer.transport.packetsSent;
            const consumerTransportBytesSent =
              currentSnapshot.sfuSnapshots.consumer.transport.bytesSent -
              previousSnapshot.sfuSnapshots.consumer.transport.bytesSent;
            const consumerTransportBytesReceived =
              currentSnapshot.sfuSnapshots.consumer.transport.bytesReceived -
              previousSnapshot.sfuSnapshots.consumer.transport.bytesReceived;
            const producerTransportBytesSent =
              currentSnapshot.sfuSnapshots.producer.transport.bytesSent -
              previousSnapshot.sfuSnapshots.producer.transport.bytesSent;
            const producerTransportBytesReceived =
              currentSnapshot.sfuSnapshots.producer.transport.bytesReceived -
              previousSnapshot.sfuSnapshots.producer.transport.bytesReceived;

            summary.dataTransportPacketsSentSFU.push(
              producerTransportPacketsSent,
            );
            summary.dataTransportPacketsReceivedSFU.push(
              consumerTransportPacketsReceived,
            );
            summary.dataTransportBytesSentSFU.push(producerTransportBytesSent);
            summary.dataTransportBytesReceivedSFU.push(
              consumerTransportBytesReceived,
            );

            summary.dataTransportBitrateSentSFU.push(
              producerTransportBitrateSent.toFixed(2),
            );
            summary.dataTransportBitrateReceivedSFU.push(
              consumerTransportBitrateReceived.toFixed(2),
            );
            summary.dataCurrentP2PConnections.push(
              currentSnapshot.activeP2PConnections,
            );
            summary.dataCurrentSFUConnections.push(
              currentSnapshot.activeSFUConnections,
            );
            summary.dataTotalBitrateSentP2P.push(
              totalBitrateSent + producerTransportBitrateSent,
            );
            summary.dataTotalBitrateReceivedP2P.push(
              totalBitrateReceived + consumerTransportBitrateReceived,
            );
            summary.dataTotalBytesSentP2P.push(
              totalBytesSent + producerTransportBytesSent,
            );
            summary.dataTotalBytesReceivedP2P.push(
              totalBytesReceived + consumerTransportBytesReceived,
            );
            summary.dataTotalPacketsSentP2P.push(
              totalPacketsSent + producerTransportPacketsSent,
            );
            summary.dataTotalPacketsLostP2P.push(
              totalPacketsLost + sfuVideoPacketsLostInbound,
            );
            summary.dataTotalPacketsReceivedP2P.push(
              totalPacketsReceived + consumerTransportPacketsReceived,
            );
          }
        }

        for (const key in summary.p2pLocalResolutions) {
          if (summary.p2pLocalResolutions[key].length < resume) {
            const tempArray = new Array(
              resume - summary.p2pLocalResolutions[key].length,
            );
            tempArray.fill(0);
            summary.p2pLocalResolutions[key] =
              summary.p2pLocalResolutions[key].concat(tempArray);
          }
        }
        for (const key in summary.p2pRemoteResolutions) {
          if (summary.p2pRemoteResolutions[key].length < resume) {
            const tempArray = new Array(
              resume - summary.p2pRemoteResolutions[key].length,
            );
            tempArray.fill(0);
            summary.p2pRemoteResolutions[key] =
              summary.p2pRemoteResolutions[key].concat(tempArray);
          }
        }
        for (const key in summary.sfuRemoteResolutions) {
          if (summary.sfuRemoteResolutions[key].length < resume) {
            const tempArray = new Array(
              resume - summary.sfuRemoteResolutions[key].length,
            );
            tempArray.fill(0);
            summary.sfuRemoteResolutions[key] =
              summary.sfuRemoteResolutions[key].concat(tempArray);
          }
        }
        return summary;
      });
  }

  private static getAvgNonZeroValueFromArray(array: any[]): {
    avg: number;
    sample: number;
  } {
    let avg = 0;
    const filtered = array.filter((item) => item !== 0);
    if (filtered.length > 1) {
      const sum = filtered.reduce((a, b) => a + b);
      avg = sum / filtered.length;
    }

    return {
      avg: avg,
      sample: filtered.length,
    };
  }
}
