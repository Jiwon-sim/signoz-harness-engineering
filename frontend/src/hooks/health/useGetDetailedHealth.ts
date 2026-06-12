import getDetailedHealth from 'api/health/getDetailedHealth';
import { useQuery, UseQueryResult } from 'react-query';
import { ErrorResponse, SuccessResponse } from 'types/api';
import { PayloadProps } from 'types/api/health/getDetailedHealth';

export const DETAILED_HEALTH_QUERY_KEY = 'DETAILED_HEALTH';

// useGetDetailedHealth fetches the detailed system health via react-query (REQ-6, AC-6.4).
export const useGetDetailedHealth = (): UseQueryResult<
	SuccessResponse<PayloadProps> | ErrorResponse
> =>
	useQuery<SuccessResponse<PayloadProps> | ErrorResponse>({
		queryKey: [DETAILED_HEALTH_QUERY_KEY],
		queryFn: getDetailedHealth,
	});
