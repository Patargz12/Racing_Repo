interface ErrorMessageProps {
  error: string;
}

export default function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <div className="mb-8 p-4 bg-red-950/30 border border-red-900/50 rounded-xl max-w-4xl mx-auto backdrop-blur-sm">
      <p className="text-red-400 font-medium">{error}</p>
    </div>
  );
}
