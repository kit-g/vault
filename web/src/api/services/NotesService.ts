/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AttachmentResponse } from '../models/AttachmentResponse';
import type { NoteIn } from '../models/NoteIn';
import type { NoteOut } from '../models/NoteOut';
import type { NoteShareResponse } from '../models/NoteShareResponse';
import type { NotesResponse } from '../models/NotesResponse';
import type { PresignDownloadResponse } from '../models/PresignDownloadResponse';
import type { PresignUploadRequest } from '../models/PresignUploadRequest';
import type { PresignUploadResponse } from '../models/PresignUploadResponse';
import type { ShareToUserRequest } from '../models/ShareToUserRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NotesService {
    /**
     * List user notes
     * Returns paginated notes for the authenticated user with optional filtering
     * @returns NotesResponse OK
     * @throws ApiError
     */
    public static getNotes({
        page = 1,
        limit = 10,
        archived,
        encrypted,
    }: {
        /**
         * Page number
         */
        page?: number,
        /**
         * Items per page
         */
        limit?: number,
        /**
         * Filter by archived status
         */
        archived?: boolean,
        /**
         * Filter by encrypted status
         */
        encrypted?: boolean,
    }): CancelablePromise<NotesResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/notes',
            query: {
                'page': page,
                'limit': limit,
                'archived': archived,
                'encrypted': encrypted,
            },
            errors: {
                401: `Unauthorized`,
                500: `Server error`,
            },
        });
    }
    /**
     * Create a new note
     * Creates a note for the authenticated user
     * @returns NoteOut Created
     * @throws ApiError
     */
    public static createNote({
        requestBody,
    }: {
        /**
         * Note object
         */
        requestBody: NoteIn,
    }): CancelablePromise<NoteOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/notes',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * List user attachments
     * Returns paginated attachments for the authenticated user with optional filtering
     * @returns AttachmentResponse OK
     * @throws ApiError
     */
    public static getAttachments({
        page = 1,
        limit = 10,
        deleted,
        mimeType,
        noteId,
        sort = 'desc',
    }: {
        /**
         * Page number
         */
        page?: number,
        /**
         * Items per page
         */
        limit?: number,
        /**
         * Filter by deleted notes
         */
        deleted?: boolean,
        /**
         * Filter by MIME type
         */
        mimeType?: string,
        /**
         * Filter by note ID
         */
        noteId?: string,
        /**
         * Sort by creation date (asc/desc)
         */
        sort?: string,
    }): CancelablePromise<AttachmentResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/notes/attachments',
            query: {
                'page': page,
                'limit': limit,
                'deleted': deleted,
                'mime_type': mimeType,
                'note_id': noteId,
                'sort': sort,
            },
            errors: {
                401: `Unauthorized`,
                500: `Server error`,
            },
        });
    }
    /**
     * List deleted notes
     * Returns paginated soft-deleted notes for the authenticated user
     * @returns NotesResponse OK
     * @throws ApiError
     */
    public static getDeletedNotes({
        page = 1,
        limit = 10,
    }: {
        /**
         * Page number
         */
        page?: number,
        /**
         * Items per page
         */
        limit?: number,
    }): CancelablePromise<NotesResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/notes/deleted',
            query: {
                'page': page,
                'limit': limit,
            },
            errors: {
                401: `Unauthorized`,
                500: `Server error`,
            },
        });
    }
    /**
     * List shared notes
     * Returns paginated notes that have been shared with the authenticated user
     * @returns NotesResponse OK
     * @throws ApiError
     */
    public static getSharedNotes({
        page = 1,
        limit = 10,
    }: {
        /**
         * Page number
         */
        page?: number,
        /**
         * Items per page
         */
        limit?: number,
    }): CancelablePromise<NotesResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/notes/shared-with-me',
            query: {
                'page': page,
                'limit': limit,
            },
            errors: {
                401: `Unauthorized`,
                500: `Server error`,
            },
        });
    }
    /**
     * Delete a note
     * Deletes a note owned by the authenticated user
     * @returns void
     * @throws ApiError
     */
    public static deleteNote({
        noteId,
        hard = false,
    }: {
        /**
         * Note ID
         */
        noteId: string,
        /**
         * Hard delete flag
         */
        hard?: boolean,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/notes/{noteId}',
            path: {
                'noteId': noteId,
            },
            query: {
                'hard': hard,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get a single note
     * Retrieves a specific note owned by the authenticated user
     * @returns NoteOut OK
     * @throws ApiError
     */
    public static getNote({
        noteId,
    }: {
        /**
         * Note UUID
         */
        noteId: string,
    }): CancelablePromise<NoteOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/notes/{noteId}',
            path: {
                'noteId': noteId,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Edit a note
     * Updates the note fields for the authenticated user
     * @returns NoteOut OK
     * @throws ApiError
     */
    public static editNote({
        noteId,
        requestBody,
    }: {
        /**
         * Note ID
         */
        noteId: string,
        /**
         * Note fields
         */
        requestBody: NoteIn,
    }): CancelablePromise<NoteOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/notes/{noteId}',
            path: {
                'noteId': noteId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Generate a presigned S3 upload URL
     * Generates a presigned URL for uploading an attachment to a specific note
     * @returns PresignUploadResponse OK
     * @throws ApiError
     */
    public static getUploadUrl({
        noteId,
        requestBody,
    }: {
        /**
         * Note ID
         */
        noteId: string,
        /**
         * Upload parameters
         */
        requestBody: PresignUploadRequest,
    }): CancelablePromise<PresignUploadResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/notes/{noteId}/attachments',
            path: {
                'noteId': noteId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Delete an attachment
     * @returns void
     * @throws ApiError
     */
    public static deleteAttachment({
        noteId,
        attachmentId,
    }: {
        /**
         * Note ID
         */
        noteId: string,
        /**
         * Attachment ID
         */
        attachmentId: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/notes/{noteId}/attachments/{attachmentId}',
            path: {
                'noteId': noteId,
                'attachmentId': attachmentId,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                404: `Not Found`,
            },
        });
    }
    /**
     * Get presigned download URL for an attachment
     * Generates a temporary URL for securely downloading a note's attachment.
     * @returns PresignDownloadResponse OK
     * @throws ApiError
     */
    public static getDownloadUrl({
        noteId,
        attachmentId,
    }: {
        /**
         * Note ID (UUID)
         */
        noteId: string,
        /**
         * Attachment ID (UUID)
         */
        attachmentId: string,
    }): CancelablePromise<PresignDownloadResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/notes/{noteId}/attachments/{attachmentId}',
            path: {
                'noteId': noteId,
                'attachmentId': attachmentId,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Restore a deleted note
     * Restores a soft-deleted note owned by the authenticated user
     * @returns void
     * @throws ApiError
     */
    public static restoreNote({
        noteId,
    }: {
        /**
         * Note ID
         */
        noteId: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/notes/{noteId}/restore',
            path: {
                'noteId': noteId,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * List note shares
     * Returns a list of users the note has been shared with
     * @returns NoteShareResponse OK
     * @throws ApiError
     */
    public static getNoteShares({
        noteId,
    }: {
        /**
         * Note ID
         */
        noteId: string,
    }): CancelablePromise<NoteShareResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/notes/{noteId}/share',
            path: {
                'noteId': noteId,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Share note with user
     * Allows the authenticated user to share a note they own with another user, specifying read or write permissions.
     * @returns void
     * @throws ApiError
     */
    public static shareNoteToUser({
        noteId,
        requestBody,
    }: {
        /**
         * Note ID (UUID)
         */
        noteId: string,
        /**
         * Sharing request
         */
        requestBody: ShareToUserRequest,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/notes/{noteId}/share',
            path: {
                'noteId': noteId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request (invalid UUID, payload, or permission)`,
                404: `Note not found or not owned by user`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Revoke note access
     * Removes note sharing permissions for a specific user
     * @returns void
     * @throws ApiError
     */
    public static revokeNoteShare({
        noteId,
        userId,
    }: {
        /**
         * Note ID
         */
        noteId: string,
        /**
         * User ID to revoke access from
         */
        userId: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/notes/{noteId}/shares/{userId}',
            path: {
                'noteId': noteId,
                'userId': userId,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
}
