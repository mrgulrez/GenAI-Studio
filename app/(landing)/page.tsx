import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div>
        <h1>AI SaaS</h1>
        <p> LandingPage (Unprotected)</p>
         <div className='flex'>
         <div >
            <Link href="/sign-in">
                <Button>Sign In</Button>
            </Link>
         </div>
            <div>
                <Link href="/sign-up">
                    <Button>Sign Up</Button>
                </Link>
                </div>
        </div>
         </div>
    );
    }