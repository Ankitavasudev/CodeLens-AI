import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('CodeLens AI', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/CodeLens AI/i)).toBeInTheDocument();
  });

  test('renders search input', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/search code/i)).toBeInTheDocument();
  });

  test('renders code editor area', () => {
    render(<App />);
    expect(screen.getByText(/Enter your code here/i)).toBeInTheDocument();
  });

  test('search button is clickable', () => {
    render(<App />);
    const searchButton = screen.getByText(/Analyze/i);
    expect(searchButton).not.toBeDisabled();
  });

  test('language selector exists', () => {
    render(<App />);
    expect(screen.getByText(/Select language/i)).toBeInTheDocument();
  });

  test('feature cards are displayed', () => {
    render(<App />);
    expect(screen.getByText(/Code Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Smart Search/i)).toBeInTheDocument();
  });
});