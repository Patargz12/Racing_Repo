interface ErrorMessageProps {
  error: string;
}

export default function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl max-w-4xl mx-auto">
      <p className="text-red-700 font-medium">{error}</p>
    </div>
  );
}
