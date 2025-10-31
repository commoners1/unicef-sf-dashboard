import { useParams, Link } from 'react-router-dom';
export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  // Placeholder: JobPage should later fetch by id
  return (
    <div className="max-w-xl mx-auto mt-8 space-y-6">
      <Link className="text-blue-600 hover:underline" to="/jobs">&larr; Back to Jobs</Link>
      <div className="text-2xl font-bold">Job Details (ID: {id})</div>
      <div className="p-6 bg-card shadow rounded">Job detail logic TBA</div>
    </div>
  );
}
