"use client";

import { QuizMember } from "@igorkowalczyk/quiz-utils/validators/quiz";
import { CheckIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import Confetti from "@/components/confetti";
import { socket } from "@/lib/socket";

export function YourAnswers({ quizId, member }: { quizId: string; member: QuizMember }) {
 const router = useRouter();

 useEffect(() => {
  socket.emit("joinOrRejoinQuiz", { userId: member.userId, quizId });

  socket.on("nextQuestion", () => {
   router.replace(`/quiz/${quizId}/questions?userId=${member.userId}`);
  });

  socket.on("quizCompleted", () => {
   toast.success("Quiz completed successfully");
   router.replace(`/quiz/${quizId}/results?userId=${member.userId}`);
  });

  socket.on("kicked", () => {
   toast.error("You have been kicked from the quiz");
   router.push("/");
  });

  socket.on("redirectToAnswers", () => {
   router.replace(`/quiz/${quizId}/questions/answers?userId=${member.userId}`);
  });

  socket.on("error", (error: { message: string }) => {
   toast.error(error.message);
  });

  return () => {
   socket.off("nextQuestion");
   socket.off("quizCompleted");
   socket.off("kicked");
   socket.off("redirectToAnswers");
   socket.off("error");
  };
 }, [quizId, router, member.userId]);

 return (
  <>
   {member.goodAnswer && <Confetti />}
   {member.goodAnswer ? (
    <CheckIcon className="dark:bg-green-500/05 mx-0 size-12 rounded-full border border-green-500 bg-green-500/10 p-3 text-green-500 md:size-16 md:p-4" />
   ) : (
    <XIcon className="dark:bg-red-500/05 mx-0 size-12 rounded-full border border-red-500 bg-red-500/10 p-3 text-red-500 md:size-16 md:p-4" />
   )}

   <h1 className="text-center text-lg md:text-2xl">Your answer was {member.goodAnswer ? "correct" : "incorrect"}!</h1>
   <p className="text-muted-foreground mb-4 text-center">
    You scored
    <span className="font-bold"> {member.newScore} </span>
    points! {member.goodAnswer ? "Well done!" : "Better luck next time!"} 🎉
   </p>
  </>
 );
}
