import { Badge } from '@signozhq/ui/badge';
import { Typography } from '@signozhq/ui/typography';
import { Spin } from 'antd';
import { useGetDetailedHealth } from 'hooks/health/useGetDetailedHealth';
import { DetailedHealth } from 'types/api/health/getDetailedHealth';

import HealthCard from './HealthCard';
import { isHealthyStatus } from './utils';

function SystemHealth(): JSX.Element {
	const { data, isLoading, isError } = useGetDetailedHealth();

	if (isLoading) {
		return <Spin data-testid="system-health-loading" />;
	}

	const payload = (data?.payload as DetailedHealth | null) ?? undefined;

	if (isError || !payload) {
		return (
			<div data-testid="system-health-error">
				<Typography.Text>Failed to load system health.</Typography.Text>
			</div>
		);
	}

	const overallHealthy = isHealthyStatus(payload.status);

	return (
		<div data-testid="system-health-page">
			<Typography.Title>System Health</Typography.Title>
			<div data-testid="system-health-overall">
				<Badge color={overallHealthy ? 'forest' : 'cherry'} variant="outline">
					{payload.status}
				</Badge>
			</div>

			<HealthCard
				title="ClickHouse"
				testId="health-clickhouse"
				check={payload.checks.clickhouse}
			/>
			<HealthCard title="Disk" testId="health-disk" check={payload.checks.disk} />
		</div>
	);
}

export default SystemHealth;
