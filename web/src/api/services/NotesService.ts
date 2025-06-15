/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NoteIn } from '../models/NoteIn';
import type { NoteOut } from '../models/NoteOut';
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
     * @param page Page number
     * @param limit Items per page
     * @param archived Filter by archived status
     * @param encrypted Filter by encrypted status
     * @returns NoteOut OK
     * @throws ApiError
     */
    public static getNotes(
        page: number = 1,
        limit: number = 10,
        archived?: boolean,
        encrypted?: boolean,
    ): CancelablePromise<Array<NoteOut>> {
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
     * @param requestBody Note object
     * @returns NoteOut Created
     * @throws ApiError
     */
    public static createNote(
        requestBody: NoteIn,
    ): CancelablePromise<NoteOut> {
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
     * Delete a note
     * Deletes a note owned by the authenticated user
     * @param noteId Note ID
     * @returns void
     * @throws ApiError
     */
    public static deleteNote(
        noteId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
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
     * Get a single note
     * Retrieves a specific note owned by the authenticated user
     * @param noteId Note UUID
     * @returns NoteOut OK
     * @throws ApiError
     */
    public static getNote(
        noteId: string,
    ): CancelablePromise<NoteOut> {
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
     * @param noteId Note ID
     * @param requestBody Note fields
     * @returns NoteOut OK
     * @throws ApiError
     */
    public static editNote(
        noteId: string,
        requestBody: NoteIn,
    ): CancelablePromise<NoteOut> {
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
     * @param noteId Note ID
     * @param requestBody Upload parameters
     * @returns PresignUploadResponse OK
     * @throws ApiError
     */
    public static getUploadUrl(
        noteId: string,
        requestBody: PresignUploadRequest,
    ): CancelablePromise<PresignUploadResponse> {
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
     * @param noteId Note ID
     * @param attachmentId Attachment ID
     * @returns void
     * @throws ApiError
     */
    public static deleteAttachment(
        noteId: string,
        attachmentId: string,
    ): CancelablePromise<void> {
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
     * @param noteId Note ID (UUID)
     * @param attachmentId Attachment ID (UUID)
     * @returns PresignDownloadResponse OK
     * @throws ApiError
     */
    public static getDownloadUrl(
        noteId: string,
        attachmentId: string,
    ): CancelablePromise<PresignDownloadResponse> {
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
     * Share note with user
     * Allows the authenticated user to share a note they own with another user, specifying read or write permissions.
     * @param noteId Note ID (UUID)
     * @param requestBody Sharing request
     * @returns void
     * @throws ApiError
     */
    public static shareNoteToUser(
        noteId: string,
        requestBody: ShareToUserRequest,
    ): CancelablePromise<void> {
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
}
