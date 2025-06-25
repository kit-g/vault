/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FirebaseSignInRequest } from '../models/FirebaseSignInRequest';
import type { Login } from '../models/Login';
import type { LoginOut } from '../models/LoginOut';
import type { Session } from '../models/Session';
import type { UserIn } from '../models/UserIn';
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
     * Log in a user
     * Authenticates a user and returns a JWT token
     * @returns LoginOut OK
     * @throws ApiError
     */
    public static login({
        requestBody,
    }: {
        /**
         * Login credentials
         */
        requestBody: Login,
    }): CancelablePromise<LoginOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/login',
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
    /**
     * Register a new user
     * Register using email, password, and username
     * @returns UserOut Created
     * @throws ApiError
     */
    public static register({
        requestBody,
    }: {
        /**
         * user info
         */
        requestBody: UserIn,
    }): CancelablePromise<UserOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                409: `Conflict`,
            },
        });
    }
}
