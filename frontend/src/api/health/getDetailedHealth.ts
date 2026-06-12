import axios from 'api';
import { ErrorResponseHandler } from 'api/ErrorResponseHandler';
import { AxiosError } from 'axios';
import { ErrorResponse, SuccessResponse } from 'types/api';
import { PayloadProps } from 'types/api/health/getDetailedHealth';

// getDetailedHealth calls GET /api/v1/health?detailed.
// A degraded system responds 503 *with* a JSON body, so we surface that body as a
// successful payload instead of treating it as a transport error (REQ-8).
const getDetailedHealth = async (): Promise<
	SuccessResponse<PayloadProps> | ErrorResponse
> => {
	try {
		const response = await axios.get(`/health?detailed`);

		return {
			statusCode: 200,
			error: null,
			message: 'Success',
			payload: response.data,
		};
	} catch (error) {
		const axiosError = error as AxiosError;
		const { response } = axiosError;

		if (response?.status === 503 && response?.data) {
			// Surface the degraded body as a successful payload; the UI distinguishes
			// healthy vs degraded via payload.status, not the HTTP code.
			return {
				statusCode: 200,
				error: null,
				message: 'Degraded',
				payload: response.data as PayloadProps,
			};
		}

		return ErrorResponseHandler(axiosError);
	}
};

export default getDetailedHealth;
