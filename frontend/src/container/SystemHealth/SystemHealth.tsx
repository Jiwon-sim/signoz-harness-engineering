import { Typography } from '@signozhq/ui/typography';
import { Col, Row, Spin } from 'antd';
import { useGetDetailedHealth } from 'hooks/health/useGetDetailedHealth';
import { DetailedHealth } from 'types/api/health/getDetailedHealth';

import ClickHouseCard from './ClickHouseCard';
import DiskCard from './DiskCard';
import { isHealthyStatus } from './utils';

import './SystemHealth.styles.scss';

function SystemHealth(): JSX.Element {
	const { data, isLoading, isError } = useGetDetailedHealth();

	if (isLoading) {
		return <Spin data-testid="system-health-loading" />;
	}

	const payload = (data?.payload as DetailedHealth | null) ?? undefined;

	if (isError || !payload) {
		return (
			<div className="system-health" data-testid="system-health-error">
				<Typography.Text>Failed to load system health.</Typography.Text>
			</div>
		);
	}

	const overallHealthy = isHealthyStatus(payload.status);
	const tone = overallHealthy ? 'ok' : 'bad';

	return (
		<div className="system-health" data-testid="system-health-page">
			<header className="system-health__header">
				<Typography.Title className="system-health__title">
					System Health
				</Typography.Title>
				<span
					className={`overall-status overall-status--${tone}`}
					data-testid="system-health-overall"
				>
					<span className={`status-dot status-dot--${tone}`} />
					{overallHealthy ? 'All Systems Operational' : 'Degraded'}
				</span>
			</header>

			<Row gutter={[16, 16]} className="system-health__grid">
				<Col xs={24} md={12}>
					<ClickHouseCard check={payload.checks.clickhouse} />
				</Col>
				<Col xs={24} md={12}>
					<DiskCard check={payload.checks.disk} />
				</Col>
			</Row>
		</div>
	);
}

export default SystemHealth;
