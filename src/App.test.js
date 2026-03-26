import { render, screen } from '@testing-library/react';
import App from './App';

test('renders storefront brand', () => {
  render(<App />);
  expect(screen.getByText(/NovaMart/i)).toBeInTheDocument();
});
