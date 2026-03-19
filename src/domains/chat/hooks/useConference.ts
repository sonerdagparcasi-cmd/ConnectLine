import { useState } from "react";
import { chatService } from "../services/chatService";
import { Conference } from "../types/chat.types";

/**
 * useConference
 * - Conference state’i UI’dan izole eder
 */
export function useConference(conferenceId?: string) {
  const [conference, setConference] = useState<Conference | undefined>(
    conferenceId ? chatService.getConference(conferenceId) : undefined
  );

  const refresh = () => {
    if (!conferenceId) return;
    setConference(chatService.getConference(conferenceId));
  };

  return {
    conference,

    create: (hostUserId: string, title?: string) => {
      const conf = chatService.createConference(hostUserId, title);
      setConference(conf);
      return conf;
    },

    start: () => {
      if (!conferenceId) return;
      chatService.startConference(conferenceId);
      refresh();
    },

    end: () => {
      if (!conferenceId) return;
      chatService.endConference(conferenceId);
      refresh();
    },

    join: (userId: string) => {
      if (!conferenceId) return;
      chatService.joinConference(conferenceId, userId);
      refresh();
    },

    leave: (userId: string) => {
      if (!conferenceId) return;
      chatService.leaveConference(conferenceId, userId);
      refresh();
    },

    toggleMute: (userId: string, muted: boolean) => {
      if (!conferenceId) return;
      chatService.setParticipantMuted(conferenceId, userId, muted);
      refresh();
    },

    toggleVideo: (userId: string, enabled: boolean) => {
      if (!conferenceId) return;
      chatService.setParticipantVideo(conferenceId, userId, enabled);
      refresh();
    },

    startScreenShare: (ownerUserId: string) => {
      if (!conferenceId) return;
      chatService.startScreenShare(conferenceId, ownerUserId);
      refresh();
    },

    stopScreenShare: () => {
      if (!conferenceId) return;
      chatService.stopScreenShare(conferenceId);
      refresh();
    },

    refresh,
  };
}
