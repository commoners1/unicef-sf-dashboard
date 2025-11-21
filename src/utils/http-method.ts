/**
 * Get the color class for HTTP method badges
 */
export function getMethodBadgeColor(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'bg-blue-600';
    case 'POST':
      return 'bg-green-600';
    case 'PUT':
      return 'bg-yellow-600';
    case 'PATCH':
      return 'bg-orange-600';
    case 'DELETE':
      return 'bg-red-600';
    default:
      return 'bg-gray-600';
  }
}

