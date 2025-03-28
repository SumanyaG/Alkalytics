import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./index.css";
import { ApolloProvider } from "@apollo/client";
import client from "./utils/apolloClient";
import { BrowserRouter } from "react-router-dom";
import { CookiesProvider } from "react-cookie";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#ff4081",
    },
  },
});

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <ApolloProvider client={client}>
      <React.StrictMode>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <CookiesProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </CookiesProvider>
        </ThemeProvider>
      </React.StrictMode>
    </ApolloProvider>
  );
}
