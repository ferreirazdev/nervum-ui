import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { RegisterPage } from './RegisterPage';
import * as api from '@/lib/api';

vi.mock('@/features/map', () => ({
  MapPageDemo: () => <div data-testid="map-demo" />,
}));

const registerMock = vi.fn().mockResolvedValue({
  id: 'u1',
  email: 'a@b.c',
  name: 'Test',
  role: 'admin',
  onboarding: false,
});

vi.mock('../context', () => ({
  useAuth: () => ({
    register: registerMock,
    loading: false,
    user: null,
    logout: vi.fn(),
    login: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.spyOn(api, 'listBillingPlans').mockResolvedValue([
      {
        id: 'p1',
        slug: 'starter',
        name: 'Starter',
        description: 'Test plan',
        currency: 'usd',
        price_interval: 'month',
        display_amount_cents: 100,
      },
    ]);
  });

  it('shows the form when plan query matches an active billing plan', async () => {
    render(
      <MemoryRouter initialEntries={['/register?plan=starter']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument();
    });
  });

  it('shows the form without a plan query (register without subscribing)', async () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument();
    });
    expect(api.listBillingPlans).not.toHaveBeenCalled();
  });
});
