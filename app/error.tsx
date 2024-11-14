"use client";

import { HomeIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Error() {
 return (
  <>
   <XIcon className="dark:bg-red-500/05 mx-0 size-12 rounded-full border border-red-500 bg-red-500/10 p-3 text-red-500 md:size-16 md:p-4" />
   <h1 className="text-center text-2xl">500 - Internal Server Error!</h1>
   <p className="text-center text-muted-foreground">An unexpected error occurred! Please try again later.</p>

   <Link href="/" className={buttonVariants({ variant: "default" })}>
    <HomeIcon className="mr-2 size-4" />
    Go Home
   </Link>
  </>
 );
}
