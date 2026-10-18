export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';
export type InvitationChannel = 'email' | 'sms' | 'link';
export type InvitationChannels = Record<'email' | 'sms', { available: boolean; reason: string | null }>;
export interface InvitationResult {
    link?: string; emailed?: boolean; deliveryError?: string | null;
    delivery?: { channel: InvitationChannel; status: 'accepted' | 'queued' | 'failed' | 'not_requested'; reason?: string | null };
}
export interface PortalInvitation {
    id: number; patientid: number; patientName: string; patientNumber: string;
    email: string | null; created_at: string; expires_at: string; accepted_at: string | null;
    revoked_at: string | null; status: InvitationStatus; created_by: number | null; invitedBy?: string | null;
    channels?: InvitationChannels;
}
export interface InvitationPage { invitations: PortalInvitation[]; total: number; page: number; pageSize: number }

export function invitationEndpoint(status: string, search: string, page: number, pageSize: number) {
    return `patient-portal/admin/invitations?${new URLSearchParams({ status, search: search.trim(), page: String(page), pageSize: String(pageSize) })}`;
}

export function validateInvitationPage(data: InvitationPage): InvitationPage {
    if (!data || !Array.isArray(data.invitations) || !Number.isSafeInteger(data.total) || data.total < 0
        || !Number.isSafeInteger(data.page) || data.page < 1 || !Number.isSafeInteger(data.pageSize) || data.pageSize < 1) {
        throw new Error('The invitation list response was invalid. Please retry.');
    }
    return data;
}

export function canReplaceInvitation(status: InvitationStatus) { return status === 'pending' || status === 'expired'; }

export function channelReason(channels: InvitationChannels | undefined, channel: 'email' | 'sms') {
    return channels?.[channel]?.available ? null : channels?.[channel]?.reason || `${channel.toUpperCase()} availability could not be verified. Refresh before sending.`;
}

export function invitationDeliveryNotice(invitation: InvitationResult, replacement = true) {
    const prefix = replacement ? 'Replacement invitation created. The previous link no longer works.' : 'Invitation created.';
    if (invitation.delivery) {
        const { channel, status, reason } = invitation.delivery;
        if (status === 'accepted' || status === 'queued') return { variant: 'success', text: `${prefix} ${channel.toUpperCase()} ${status === 'queued' ? 'queued for processing' : 'accepted by the provider'}; delivery is not confirmed.` };
        if (status === 'not_requested') return { variant: 'info', text: `${prefix} No message sent. Copy and share the link securely.` };
        return { variant: 'warning', text: `${prefix} ${reason || invitation.deliveryError || `${channel.toUpperCase()} provider acceptance was not confirmed.`} Copy the new link and share it securely. Wait at least 60 seconds before retrying.` };
    }
    return invitation.emailed
        ? { variant: 'success', text: `${prefix} Email accepted by the provider; delivery is not confirmed.` }
        : { variant: 'warning', text: `${prefix} Invitation not emailed. Copy the new link and share it securely with the patient.` };
}
