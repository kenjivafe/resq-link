import React from 'react';

import { renderRN, screen } from '@/testing-library/react-native';

import App from '../../App';

describe('ReportIncident flow', () => {
  it('renders the anonymous incident heading', async () => {
    renderRN(<App />);

    await expect(screen.findByText('Anonymous Incident Report')).resolves.toBeTruthy();
  });
});
