import { Typography } from '@signozhq/ui/typography';
import { Card } from 'antd';
import { CheckResult } from 'types/api/health/getDetailedHealth';

import { isHealthyStatus } from './utils';

interface ClickHouseCardProps {
	check?: CheckResult;
}

function ClickHouseCard({ check }: ClickHouseCardProps): JSX.Element {
	const status = check?.status ?? 'unknown';
	const healthy = isHealthyStatus(status);
	const tone = healthy ? 'ok' : 'bad';

	return (
		<Card className="health-card" data-testid="health-clickhouse">
			<div className="health-card__head">
				<Typography.Title className="health-card__name">ClickHouse</Typography.Title>
				<span
					className={`health-card__status health-card__status--${tone}`}
					data-testid="health-clickhouse-status"
				>
					<span className={`status-dot status-dot--${tone}`} />
					{status}
				</span>
			</div>

			<div className="health-card__metric" data-testid="health-clickhouse-latency">
				<span className="health-card__value">
					{check?.latency_ms ?? '-'}
				</span>
				<span className="health-card__unit">ms</span>
			</div>
			<Typography.Text className="health-card__label">
				Response latency
			</Typography.Text>

			{check?.error && (
				<Typography.Text
					className="health-card__error"
					data-testid="health-clickhouse-error"
				>
					{check.error}
				</Typography.Text>
			)}
		</Card>
	);
}

ClickHouseCard.defaultProps = {
	check: undefined,
};

export default ClickHouseCard;
