import { HomeIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
 return (
  <>
   <XIcon className="dark:bg-red-500/05 mx-0 size-12 rounded-full border border-red-500 bg-red-500/10 p-3 text-red-500 md:size-16 md:p-4" />
   <h1 className="text-center text-2xl">404 - Page Not Found!</h1>
   <p className="text-muted-foreground mb-4 text-center">The page you are looking for does not exist!</p>

   <Link href="/" className={buttonVariants({ variant: "default" })}>
    <HomeIcon />
    Go Home
   </Link>
  </>
 );
}
