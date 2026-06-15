import { Typography } from '@signozhq/ui/typography';
import { Card } from 'antd';
import { CheckResult } from 'types/api/health/getDetailedHealth';

import { formatBytes, isHealthyStatus } from './utils';

interface DiskCardProps {
	check?: CheckResult;
}

function DiskCard({ check }: DiskCardProps): JSX.Element {
	const status = check?.status ?? 'unknown';
	const healthy = isHealthyStatus(status);
	const tone = healthy ? 'ok' : 'bad';
	const used = check?.used_percent ?? 0;

	return (
		<Card className="health-card" data-testid="health-disk">
			<div className="health-card__head">
				<Typography.Title className="health-card__name">Disk</Typography.Title>
				<span
					className={`health-card__status health-card__status--${tone}`}
					data-testid="health-disk-status"
				>
					<span className={`status-dot status-dot--${tone}`} />
					{status}
				</span>
			</div>

			<div className="health-card__metric" data-testid="health-disk-usage">
				<span className="health-card__value">{used.toFixed(1)}</span>
				<span className="health-card__unit">% used</span>
			</div>

			<div className="progress-track">
				<div
					className={`progress-fill progress-fill--${tone}`}
					style={{ width: `${Math.min(Math.max(used, 0), 100)}%` }}
					data-testid="health-disk-progress"
				/>
			</div>

			<div className="disk-capacity">
				<Typography.Text>{formatBytes(check?.free_bytes)} free</Typography.Text>
				<Typography.Text>{formatBytes(check?.total_bytes)} total</Typography.Text>
			</div>

			{check?.error && (
				<Typography.Text
					className="health-card__error"
					data-testid="health-disk-error"
				>
					{check.error}
				</Typography.Text>
			)}
		</Card>
	);
}

DiskCard.defaultProps = {
	check: undefined,
};

export default DiskCard;
