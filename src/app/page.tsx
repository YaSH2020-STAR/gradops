import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-darkBg">
      <Navbar />
      <main>
        <section className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-light">
              Early-career jobs for recent graduates
            </h1>
            <p className="mt-6 text-lg text-gray2 max-w-xl">
              GradOps lists only roles for 0–2 years experience. No senior clutter — just
              opportunities that fit where you are.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/jobs">
                <Button size="lg" className="rounded-lg">
                  Browse Jobs
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="rounded-lg">
                  Create account
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="border-t border-stroke bg-dark/50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-semibold text-light mb-8">
              Why GradOps?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="rounded-xl border border-stroke p-6 bg-darkBg">
                <h3 className="font-semibold text-light mb-2">Recent grad only</h3>
                <p className="text-gray2 text-sm">
                  Every listing is vetted for 0–2 years experience or new grad programs.
                </p>
              </div>
              <div className="rounded-xl border border-stroke p-6 bg-darkBg">
                <h3 className="font-semibold text-light mb-2">Clear sourcing</h3>
                <p className="text-gray2 text-sm">
                  We show where each job comes from and link you to the original posting.
                </p>
              </div>
              <div className="rounded-xl border border-stroke p-6 bg-darkBg">
                <h3 className="font-semibold text-light mb-2">Match & track</h3>
                <p className="text-gray2 text-sm">
                  Save jobs, get alerts, and see how well you fit with AI-powered matching.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray3 text-sm">
              This platform lists only early-career roles (0–2 years).
            </p>
            <div className="mt-6 flex justify-center gap-8">
              <Link href="/jobs" className="text-primary hover:underline text-sm">
                Browse jobs
              </Link>
              <Link href="/auth/signup" className="text-primary hover:underline text-sm">
                Sign up as job seeker
              </Link>
              <Link href="/auth/signup" className="text-primary hover:underline text-sm">
                Post jobs as employer
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
