/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FirebaseSignInRequest } from '../models/FirebaseSignInRequest';
import type { LoginOut } from '../models/LoginOut';
import type { Session } from '../models/Session';
import type { UserOut } from '../models/UserOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Sign in with Firebase
     * Authenticates a user using Firebase ID token and returns JWT tokens
     * @returns LoginOut OK
     * @throws ApiError
     */
    public static firebaseSignin({
        requestBody,
    }: {
        /**
         * Firebase ID token
         */
        requestBody: FirebaseSignInRequest,
    }): CancelablePromise<LoginOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/firebase',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                401: `Unauthorized`,
                500: `Server error`,
            },
        });
    }
    /**
     * Get current user
     * Returns the currently authenticated user's information
     * @returns UserOut OK
     * @throws ApiError
     */
    public static me(): CancelablePromise<UserOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/me',
            errors: {
                401: `Unauthorized`,
                500: `Server error`,
            },
        });
    }
    /**
     * Refresh access token
     * Refreshes JWT access token using a refresh token
     * @returns Session OK
     * @throws ApiError
     */
    public static refresh({
        requestBody,
    }: {
        /**
         * Refresh token payload
         */
        requestBody: Record<string, string>,
    }): CancelablePromise<Session> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/refresh',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                401: `Unauthorized`,
                500: `Server error`,
            },
        });
    }
}
