import { Link } from 'react-router-dom';
export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col justify-center items-center">
      <div className="text-4xl font-bold mb-4">404 Not Found</div>
      <div className="mb-6 text-muted-foreground">The page you’re looking for does not exist.</div>
      <Link className="text-blue-600 hover:underline text-lg" to="/overview">&larr; Go to Overview</Link>
    </div>
  );
}
