import { redirect } from "next/navigation";
import QuestionAnswer from "@/components/question-answer";
import { checkQuiz } from "@/lib/actions";

export default async function Page(props: { params: Promise<{ id: string }>; searchParams: Promise<{ userId?: string }> }) {
 const searchParams = await props.searchParams;
 const params = await props.params;
 const { id } = params;
 const { userId } = searchParams;

 if (!userId) return redirect("/join");

 const quiz = await checkQuiz(id, userId);

 if (!quiz) return redirect("/join");
 if (!quiz.started) return redirect(`/quiz/${id}`);
 if (quiz.ended) return redirect(`/quiz/${id}/results?userId=${userId}`);
 if (quiz.isOnAnswer) return redirect(`/quiz/${id}/questions/answers?userId=${userId}`);

 return <QuestionAnswer userId={userId} quizId={id} />;
}
