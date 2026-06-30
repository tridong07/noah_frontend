export interface AuthFormProps {
  isLoading: boolean;
  onBack?: () => void;
  message?: { text: string; isError: boolean };
}