import { redirect } from 'next/navigation';

export default function NotFound() {
    // Redirect to the current locale's home page
    redirect('/');
}
