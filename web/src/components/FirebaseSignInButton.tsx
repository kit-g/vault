import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { AuthService, type LoginOut } from "../api";
import auth from "../features/Firebase";


export default function FirebaseSignInButton() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLoginSuccess = (login: LoginOut) => {
    console.log("Login successful!", login);
    localStorage.setItem('access_token', login.session.token);
    // localStorage.setItem('refreshToken', data.refreshToken);
    window.location.reload();
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      AuthService.firebaseSignin({ requestBody: { idToken: idToken } }).then(handleLoginSuccess);

    } catch (err: unknown) {
      let errorMessage = "An unknown error occurred.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      console.error("Error during Google sign-in:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={ handleGoogleSignIn }
        disabled={ isLoading }
        style={
          {
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#4285F4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }
        }
      >
        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <path fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
          <path fill="#FF3D00"
                d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
          <path fill="#4CAF50"
                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
          <path fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.238 44 30.025 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
        </svg>
        { isLoading ? 'Signing in...' : 'Sign in with Google' }
      </button>
      { error && <p style={ { color: 'red' } }>{ error }</p> }
    </div>
  );
};