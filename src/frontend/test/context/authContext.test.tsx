import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { useCookies } from 'react-cookie';
import { AuthProvider, useAuth } from '../../src/context/authContext';
import { gql } from "@apollo/client";

jest.mock('react-cookie', () => ({
  useCookies: jest.fn(),
}));

const mockUseCookies = useCookies as jest.Mock;

const GET_CURRENT_USER = gql`
  query GetCurrentUser($token: String!) {
    getCurrentUser(token: $token) {
      email
      role
    }
  }
`;

const mockQuery = [
  {
    request: {
      query: GET_CURRENT_USER,
      variables: { token: 'test-token' },
    },
    result: {
      data: {
        getCurrentUser: {
          email: 'test@example.com',
          role: 'admin',
        },
      },
    },
  },
];

const TestComponent = () => {
  const { isLoggedIn, userRole, handleLogin, handleLogout } = useAuth();
  return (
    <div>
      <div data-testid="isLoggedIn">{isLoggedIn ? 'true' : 'false'}</div>
      <div data-testid="userRole">{userRole.email}</div>
      <button onClick={() => handleLogin('test-token')}>Login</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    mockUseCookies.mockReturnValue([
      { session: 'test-token' },
      jest.fn(),
      jest.fn(),
    ]);
  });

  it('should provide auth context values', async () => {
    render(
      <MockedProvider mocks={mockQuery} addTypename={false}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('isLoggedIn').textContent).toBe('true');
      expect(screen.getByTestId('userRole').textContent).toBe('test@example.com');
    });
  });

  it('should handle login', async () => {
    const setCookies = jest.fn();
    mockUseCookies.mockReturnValue([
      {},
      setCookies,
      jest.fn(),
    ]);

    render(
      <MockedProvider mocks={mockQuery} addTypename={false}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MockedProvider>
    );

    screen.getByText('Login').click();

    await waitFor(() => {
      expect(setCookies).toHaveBeenCalledWith('session', 'test-token', { path: '/', secure: true, sameSite: 'none' });
      expect(screen.getByTestId('isLoggedIn').textContent).toBe('true');
    });
  });

  it('should handle logout', async () => {
    const removeCookie = jest.fn();
    mockUseCookies.mockReturnValue([
      { session: 'test-token' },
      jest.fn(),
      removeCookie,
    ]);

    render(
      <MockedProvider mocks={mockQuery} addTypename={false}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MockedProvider>
    );

    screen.getByText('Logout').click();

    await waitFor(() => {
      expect(removeCookie).toHaveBeenCalledWith('session', { path: '/', secure: true, sameSite: 'none' });
      expect(screen.getByTestId('isLoggedIn').textContent).toBe('false');
      expect(screen.getByTestId('userRole').textContent).toBe('');
    });
  });
});
