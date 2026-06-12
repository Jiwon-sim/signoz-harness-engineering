import { render, screen } from '@testing-library/react';
import { useGetDetailedHealth } from 'hooks/health/useGetDetailedHealth';

import SystemHealth from '../SystemHealth';

jest.mock('hooks/health/useGetDetailedHealth');

const mockUseGetDetailedHealth = useGetDetailedHealth as jest.Mock;

describe('SystemHealth', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('shows a loading indicator while fetching (AC-8.1)', () => {
		mockUseGetDetailedHealth.mockReturnValue({ isLoading: true });

		render(<SystemHealth />);

		expect(screen.getByTestId('system-health-loading')).toBeInTheDocument();
	});

	it('renders healthy clickhouse and disk cards (REQ-6, REQ-7)', () => {
		mockUseGetDetailedHealth.mockReturnValue({
			isLoading: false,
			isError: false,
			data: {
				payload: {
					status: 'ok',
					checks: {
						clickhouse: { status: 'healthy', latency_ms: 3 },
						disk: {
							status: 'ok',
							used_percent: 50,
							free_bytes: 1,
							total_bytes: 2,
						},
					},
				},
			},
		});

		render(<SystemHealth />);

		expect(screen.getByTestId('system-health-overall')).toHaveTextContent('ok');
		expect(screen.getByTestId('health-clickhouse-status')).toHaveTextContent(
			'healthy',
		);
		expect(screen.getByTestId('health-clickhouse-latency')).toHaveTextContent(
			'3 ms',
		);
		expect(screen.getByTestId('health-disk-status')).toHaveTextContent('ok');
	});

	it('renders a degraded (503) response without crashing (AC-8.2)', () => {
		mockUseGetDetailedHealth.mockReturnValue({
			isLoading: false,
			isError: false,
			data: {
				payload: {
					status: 'degraded',
					checks: {
						clickhouse: { status: 'unhealthy', error: 'connection refused' },
						disk: { status: 'ok', used_percent: 50 },
					},
				},
			},
		});

		render(<SystemHealth />);

		expect(screen.getByTestId('system-health-overall')).toHaveTextContent(
			'degraded',
		);
		expect(screen.getByTestId('health-clickhouse-error')).toHaveTextContent(
			'connection refused',
		);
	});

	it('shows an error state when the request fails', () => {
		mockUseGetDetailedHealth.mockReturnValue({
			isLoading: false,
			isError: true,
			data: undefined,
		});

		render(<SystemHealth />);

		expect(screen.getByTestId('system-health-error')).toBeInTheDocument();
	});
});
