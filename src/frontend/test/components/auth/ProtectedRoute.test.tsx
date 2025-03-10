import { render, screen } from "@testing-library/react";
import ProtectedRoute from "../../../src/components/auth/ProtectedRoute";
import { useAuth } from "../../../src/context/authContext";

jest.mock("../../../src/context/authContext");

describe("ProtectedRoute", () => {
  it("renders children when user is logged in", () => {
    (useAuth as jest.Mock).mockReturnValue({ isLoggedIn: true });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("renders access restricted message when user is not logged in", () => {
    (useAuth as jest.Mock).mockReturnValue({ isLoggedIn: false });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Access Restricted")).toBeInTheDocument();
    expect(screen.getByText("You must be logged in to view this page.")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });
});