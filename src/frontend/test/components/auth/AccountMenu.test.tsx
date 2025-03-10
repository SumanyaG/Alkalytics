import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { useAuth } from "../../../src/context/authContext";
import AccountMenu from "../../../src/components/auth/AccountMenu";

jest.mock("../../../src/context/authContext");

describe("AccountMenu", () => {
  const mockHandleLogout = jest.fn();

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      handleLogout: mockHandleLogout,
    });
  });

  it("renders the AccountMenu component", () => {
    render(
      <BrowserRouter>
        <AccountMenu />
      </BrowserRouter>
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("toggles the menu when the button is clicked", () => {
    render(
      <BrowserRouter>
        <AccountMenu />
      </BrowserRouter>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByText("Logout")).toBeInTheDocument();

    fireEvent.click(button);

    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });

  it("closes the menu when clicking outside", () => {
    render(
      <BrowserRouter>
        <AccountMenu />
      </BrowserRouter>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByText("Logout")).toBeInTheDocument();

    fireEvent.mouseDown(document);

    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });

  it("calls handleLogout and navigates to home on logout", () => {
    const mockNavigate = jest.fn();
    jest.mock("react-router-dom", () => ({
      ...jest.requireActual("react-router-dom"),
      useNavigate: () => mockNavigate,
    }));

    render(
      <BrowserRouter>
        <AccountMenu />
      </BrowserRouter>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    const logoutButton = screen.getByText("Logout");
    fireEvent.click(logoutButton);

    expect(mockHandleLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});