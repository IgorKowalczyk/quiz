import { BadgePlusIcon, PlayIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Page() {
 return (
  <>
   <BadgePlusIcon className="mx-0 size-12 rounded-full border p-3 md:size-16 md:p-4" />
   <h1 className="text-center text-2xl">Cheap quiz app</h1>
   <p className="mb-4 text-center text-muted-foreground">Create a quiz and share it with your friends.</p>

   <div className="flex flex-wrap justify-center gap-4">
    <Link href="/create" className={buttonVariants({ variant: "default" })}>
     <PlusIcon className="mr-2 size-4" />
     Create a quiz
    </Link>
    <Link href="/join" className={buttonVariants({ variant: "secondary" })}>
     <PlayIcon className="mr-2 size-4" />
     Join a quiz
    </Link>
   </div>
  </>
 );
}
