import ErrorCardPage from '../components/layout/ErrorCardPage';
import { FiAlertTriangle } from 'react-icons/fi';

export default function NotFound() {
  return (
    <ErrorCardPage
      errorCode="ERROR 404"
      title="Page Not Found"
      description="The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
      icon={FiAlertTriangle}
      primaryButtonText="Go to Homepage"
      primaryButtonAction="/"
      secondaryButtonText="Go Back"
      secondaryButtonAction={-1}
    />
  );
}
