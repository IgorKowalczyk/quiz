import { HomeIcon, PlayIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { QuizCodeInput } from "@/components/quiz-code-input";
import { buttonVariants } from "@/components/ui/button";

export default function Page() {
 return (
  <>
   <PlayIcon className="mx-0 size-12 rounded-full border p-3 md:size-16 md:p-4" />
   <h1 className="text-center text-lg md:text-2xl">To get started enter the quiz code</h1>
   <p className="text-muted-foreground mb-4 text-center">Enter the 6-digit code to join the quiz.</p>

   <QuizCodeInput />

   <div className="mt-4 flex flex-wrap justify-center gap-4">
    <Link href="/" className={buttonVariants({ variant: "secondary" })}>
     <HomeIcon />
     Go Home
    </Link>
    <Link href="/create" className={buttonVariants({ variant: "secondary" })}>
     <PlusIcon />
     Don&apos;t have a code?
    </Link>
   </div>
  </>
 );
}
