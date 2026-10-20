import { Component } from 'react';
import ErrorPage from './ErrorPage';

// Last line of defence: a render error anywhere shows a message instead of a blank white page.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  render() {
    return this.state.hasError ? <ErrorPage /> : this.props.children;
  }
}
