import { Box, Button, Container, SvgIcon, Typography } from "@mui/material";
import WarningIcon from "../../assets/icons/warning.svg?react";
import React, { Component } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
          <Container maxWidth="md">
            <SvgIcon sx={{ marginBottom: '2em', marginX: 'auto', width: '6em', height: '6em', display: 'block' }}>
              <WarningIcon fill="red" />
            </SvgIcon>
            <Typography sx={{ fontSize: [35], fontWeight: 700, letterSpacing: 2.5, textAlign: 'center' }}>
              Uh oh!
            </Typography>
            <Typography
              color="GrayText"
              sx={{ fontSize: [25], fontWeight: 400, letterSpacing: 2.5, textAlign: 'center' }}
            >
              Something went wrong. Please try again.
            </Typography>

            <Button
              sx={{ display: 'block', marginX: 'auto', marginTop: '2em', paddingX: '3em', maxWidth: '90%' }}
              variant="contained"
              size="large"
              onClick={() => (window.location.href = window.location.origin)}
            >
              Ok
            </Button>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
