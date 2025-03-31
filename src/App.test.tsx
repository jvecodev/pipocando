import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App'; // Importar como default export

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
