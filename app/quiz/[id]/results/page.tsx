import { ListCheckIcon, PartyPopper } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Confetti from "@/components/confetti";
import { QuizChart } from "@/components/quiz-chart";
import { buttonVariants } from "@/components/ui/button";
import { checkQuiz, getMembers } from "@/lib/actions";

export default async function Page(props: { params: Promise<{ id: string }>; searchParams: Promise<{ auth?: string; userId?: string; full?: boolean }> }) {
 const searchParams = await props.searchParams;
 const params = await props.params;
 const { id } = params;
 const { auth } = searchParams;
 const { userId } = searchParams;
 const { full } = searchParams;

 const quiz = await checkQuiz(id, auth);
 if (!quiz || !quiz.exists) return redirect("/join");
 if (!quiz.started) return redirect(`/quiz/${id}`);
 if (!quiz.ended) return redirect(`/quiz/${id}`);

 const quizMembers = await getMembers(id);
 if (!quizMembers) return redirect("/join");
 if (!quizMembers.length) return redirect("/join");

 if (!auth && !userId) return redirect("/join");

 const member = quizMembers.find((member) => member.userId === userId);

 quizMembers.sort((a, b) => b.newScore - a.newScore);
 const rank = quizMembers.findIndex((member) => member.userId === userId) + 1;

 return (
  <>
   <Confetti />
   {(quiz.authenticated && auth) || full ? (
    <>
     <PartyPopper className="mx-0 size-12 rounded-full border p-3 md:size-16 md:p-4" />
     <h1 className="text-center text-lg md:text-2xl">Quiz ended!</h1>
     <p className="mb-4 text-center text-muted-foreground">Final results are in! 🎉</p>

     <QuizChart quizMembers={quizMembers} />
     {!auth && full && (
      <Link href={`/quiz/${id}/results?userId=${userId}`} className={buttonVariants({ variant: "secondary", className: "mx-auto mt-4" })}>
       <ListCheckIcon className="mr-2 size-4" />
       See your results
      </Link>
     )}
    </>
   ) : member ? (
    <>
     <PartyPopper className="mx-0 size-12 rounded-full border p-3 md:size-16 md:p-4" />

     <h1 className="text-center text-lg md:text-2xl">You finished the quiz!</h1>
     <p className="mb-4 text-center text-muted-foreground">
      You scored
      <span className="font-bold"> {member.score} </span>
      points! You are ranked <span className="font-bold"> {rank} </span> out of <span className="font-bold"> {quizMembers.length} </span> players! 🎉
     </p>
     <Link
      href={`/quiz/${id}/results?userId=${userId}&full=true
     `}
      className={buttonVariants({ variant: "secondary", className: "mx-auto mt-4" })}
     >
      <ListCheckIcon className="mr-2 size-4" />
      See full results
     </Link>
    </>
   ) : (
    redirect("/join")
   )}
  </>
 );
}
