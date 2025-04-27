import { checkQuiz, getMembers } from "@repo/utils/actions";
import { redirect } from "next/navigation";
import { AnswersReview } from "@/components/answers-review";
import Confetti from "@/components/confetti";
import { YourAnswers } from "@/components/your-answers";

export default async function Page(props: { params: Promise<{ id: string }>; searchParams: Promise<{ auth?: string; userId?: string }> }) {
 const searchParams = await props.searchParams;
 const params = await props.params;
 const { id } = params;
 const { auth } = searchParams;
 const { userId } = searchParams;

 const quiz = await checkQuiz(id, auth);
 if (!quiz || !quiz.exists) return redirect("/join");
 if (!quiz.started) return redirect(`/quiz/${id}`);
 if (quiz.ended) {
  if (auth) return redirect(`/quiz/${id}/results?auth=${auth}`);
  return redirect(`/quiz/${id}/results?userId=${userId}`);
 }

 const quizMembers = await getMembers(id);
 if (!quizMembers) return redirect("/join");
 if (!quizMembers.length) return redirect("/join");

 if (!quiz.isOnAnswer) {
  if (auth) return redirect(`/quiz/${id}/questions?auth=${auth}`);
  return redirect(`/quiz/${id}/questions?userId=${userId}`);
 }

 if (!auth && !userId) return redirect("/join");

 const member = quizMembers.find((member) => member.userId === userId);

 return (
  <>
   {auth && quiz.authenticated ? (
    <>
     <AnswersReview memberAnswers={quizMembers} quizId={id} auth={auth} />
     <Confetti />
    </>
   ) : member ? (
    <>
     <YourAnswers quizId={id} member={member} />
    </>
   ) : (
    redirect("/join")
   )}
  </>
 );
}
