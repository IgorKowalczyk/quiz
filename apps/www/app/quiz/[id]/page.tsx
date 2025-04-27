import { checkQuiz } from "@repo/utils/actions";
import { redirect } from "next/navigation";
import QuizJoin from "@/components/quiz-join";

export default async function Page(props: { params: Promise<{ id: string }> }) {
 const params = await props.params;
 const { id } = params;

 const quiz = await checkQuiz(id);
 if (!quiz || !quiz.exists) return redirect("/join");
 if (quiz.started) return redirect("/");
 if (quiz.ended) return redirect(`/quiz/${id}/results`);
 if (quiz.isOnAnswer) return redirect(`/quiz/${id}/questions`);

 return <QuizJoin quizId={id} />;
}
