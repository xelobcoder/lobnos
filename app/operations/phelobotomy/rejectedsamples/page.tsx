import { customFetch } from '../../../../components/Auth/customFetch';
import RejectedSamplesComponent from '../../../../components/samples/rejectedListView';
import { Container, Alert } from 'react-bootstrap';


export default async function RejectedSamplesPage() {
	try {
		const response = await customFetch(`rejected/sample/list?count=10&&page=1`);
		const { result } = response;
		if (result && Array.isArray(result)) {
			return <RejectedSamplesComponent data={result} />
		}
		return <RejectedSamplesComponent data={result} />
	} catch (err) {
		return <Container className="mt-4 pls-color">
			<Alert dismissible variant="danger" className='pls-color'>
				Failed to load pending cases. Please try again later.
			</Alert>
		</Container>
	}
}
