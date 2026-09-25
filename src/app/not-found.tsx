import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-royal-blue">404</p>
      <h1 className="heading-section mt-4">Page not found</h1>
      <p className="mt-4 max-w-md text-chrome-mid">The page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="btn-primary mt-8">
        Back to home
      </Link>
    </Container>
  );
}
