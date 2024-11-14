import { PlusIcon } from "lucide-react";
import QuizCreator from "@/components/quiz-creator";

export default function Page() {
 return (
  <>
   <PlusIcon className="mx-0 size-12 rounded-full border p-3 md:size-16 md:p-4" />
   <h1 className="text-center text-lg md:text-2xl">Create a quiz</h1>
   <p className="mb-4 text-center text-muted-foreground">Name your quiz and start adding questions.</p>

   <QuizCreator />
  </>
 );
}
