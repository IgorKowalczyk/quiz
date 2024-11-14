import { redirect } from "next/navigation";
import QuestionDisplay from "@/components/question-display";
import { checkQuiz, getQuiz } from "@/lib/actions";

export default async function Page(props: { params: Promise<{ id: string }>; searchParams: Promise<{ auth?: string }> }) {
 const searchParams = await props.searchParams;
 const params = await props.params;
 const { id } = params;
 const { auth } = searchParams;
 if (!auth) return redirect("/join");

 const quiz = await checkQuiz(id, auth);
 if (!quiz) return redirect("/join");
 if (!quiz.started) return redirect(`/quiz/${id}`);

 if (!quiz.authenticated) return redirect(`/quiz/${id}/questions`);
 if (quiz.ended) return redirect(`/quiz/${id}/results?auth=${auth}`);
 if (quiz.isOnAnswer) return redirect(`/quiz/${id}/questions/answers?auth=${auth}`);

 const quizData = await getQuiz(id);
 if (!quizData) return redirect("/join");

 return <QuestionDisplay quizId={id} auth={auth} />;
}
