import { Link } from 'react-router-dom';
export default function NotFoundPage() { return <div className="flex min-h-screen items-center justify-center bg-ink px-6 text-center text-cream"><div><p className="text-sm text-moss">404</p><h1 className="mt-3 font-display text-4xl font-semibold">Page not found.</h1><Link to="/dashboard" className="mt-6 inline-flex text-sm text-muted underline decoration-moss underline-offset-4 hover:text-cream">Return to dashboard</Link></div></div>; }

