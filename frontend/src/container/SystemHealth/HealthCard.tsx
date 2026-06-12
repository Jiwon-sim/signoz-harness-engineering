import { Badge } from '@signozhq/ui/badge';
import { Typography } from '@signozhq/ui/typography';
import { Card } from 'antd';
import { CheckResult } from 'types/api/health/getDetailedHealth';

import { formatBytes, isHealthyStatus } from './utils';

interface HealthCardProps {
	title: string;
	testId: string;
	check?: CheckResult;
}

function HealthCard({ title, testId, check }: HealthCardProps): JSX.Element {
	const status = check?.status ?? 'unknown';
	const healthy = isHealthyStatus(status);

	return (
		<Card title={title} size="small" data-testid={testId}>
			<div data-testid={`${testId}-status`}>
				<Badge color={healthy ? 'forest' : 'cherry'} variant="outline">
					{status}
				</Badge>
			</div>

			{check?.latency_ms !== undefined && (
				<div data-testid={`${testId}-latency`}>
					<Typography.Text>Latency: {check.latency_ms} ms</Typography.Text>
				</div>
			)}

			{check?.used_percent !== undefined && (
				<div data-testid={`${testId}-usage`}>
					<Typography.Text>
						Used: {check.used_percent.toFixed(1)}% ({formatBytes(check.free_bytes)}{' '}
						free / {formatBytes(check.total_bytes)} total)
					</Typography.Text>
				</div>
			)}

			{check?.error && (
				<div data-testid={`${testId}-error`}>
					<Typography.Text>{check.error}</Typography.Text>
				</div>
			)}
		</Card>
	);
}

HealthCard.defaultProps = {
	check: undefined,
};

export default HealthCard;
