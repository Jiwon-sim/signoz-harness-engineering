export const formatBytes = (bytes?: number): string => {
	if (bytes === undefined) {
		return '-';
	}
	const gb = bytes / 1024 ** 3;
	return `${gb.toFixed(1)} GB`;
};

export const isHealthyStatus = (status?: string): boolean =>
	status === 'healthy' || status === 'ok';
