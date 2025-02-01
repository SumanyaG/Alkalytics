import { gql } from "@apollo/client";
import axios from 'axios';

export const typeDefs = gql`
  type AuthResponse {
    status: String
    message: String
  }

  type LoginResponse {
    status: String
    message: String
    token: String
  }

  type User {
    email: String
    role: String
  }

  type Query {
    getCurrentUser(token: String!): User
  }

  type Mutation {
    login(email: String!, password: String!) : LoginResponse
    register(email: String!, password: String!, role: String!) : AuthResponse
  }
`;

export type LoginResponse = {
  status: String
  message: String
  token: String
}

export type AuthResponse = {
  status: String
  message: String
}

export type User = {
  email: String
  role: String
}

export const resolvers = {
  Query: {
    getCurrentUser: async (
      _: any,
      { token }: { token: string },
    ): Promise<User> => {
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/auth",
          { token: token },
          { withCredentials: true,
            headers: { "Content-Type": "application/json" }
          }
        );

        return { 
          email: response.data.email,
          role: response.data.role,
        };
      } catch (error: any) {
        throw new Error("Error authenticating user.");
      }
    }
  },
  Mutation: {
    login: async (
      _: any,
      { email, password }: { email: string; password: string },
    ): Promise<LoginResponse> => {
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/login",
          { email, password },
          { withCredentials: true,
            headers: { "Content-Type": "application/json" }, 
          }
        );

        return { 
          status: response.data.status,
          message: response.data.message,
          token: response.data.token
        };
      } catch (error: any) {
        throw new Error("Invalid email or password.");
      }
    },

    register: async (
      _: any, 
      { email, password, role }: { email: string; password: string; role: string }
    ): Promise<AuthResponse> => {
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/register",
          { email, password, role },
          { withCredentials: true,
            headers: { "Content-Type": "application/json" }, 
          },
        );

        return { 
          status: response.data.status, 
          message: response.data.message
        };
      } catch (error: any) {
        throw new Error("Error creating account.");
      }
    }
  },
};