/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AttachmentOut } from './AttachmentOut';
import type { PublicUserOut } from './PublicUserOut';
import type { Share } from './Share';
export type NoteOut = {
    archived?: boolean;
    attachments?: Array<AttachmentOut>;
    author: PublicUserOut;
    content?: string;
    created_at: string;
    encrypted?: boolean;
    id: string;
    shares?: Array<Share>;
    title?: string;
    updated_at?: string;
};

