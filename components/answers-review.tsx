"use client";

import { ArrowRightIcon, PlayIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { QuizChart } from "@/components/quiz-chart";
import { Button } from "@/components/ui/button";
import { socket } from "@/lib/socket";
import { QuizMember } from "@/validators/quiz";

export function AnswersReview({ memberAnswers, quizId, auth }: { memberAnswers: QuizMember[]; quizId: string; auth: string }) {
 const router = useRouter();
 if (!memberAnswers) return <p>No answers yet</p>;

 useEffect(() => {
  socket.on("quizCompleted", () => {
   toast.success("Quiz completed successfully");
   router.replace(`/quiz/${quizId}/results?auth=${auth}`);
  });

  socket.on("redirectToAnswers", () => {
   router.replace(`/quiz/${quizId}/questions/answers?auth=${auth}`);
  });

  socket.on("error", (error: { message: string }) => {
   toast.error(error.message);
  });

  socket.on("kicked", () => {
   toast.error("You have been kicked from the quiz");
   router.replace("/");
  });

  socket.on("quizStarted", () => {
   router.replace(`/quiz/${quizId}/questions/display?auth=${auth}`);
  });

  socket.on("nextQuestion", () => {
   router.replace(`/quiz/${quizId}/questions/display?auth=${auth}`);
  });

  return () => {
   socket.off("quizCompleted");
   socket.off("redirectToAnswers");
   socket.off("error");
   socket.off("kicked");
   socket.off("quizStarted");
   socket.off("nextQuestion");
  };
 }, []);

 return (
  <>
   <PlayIcon className="mx-0 size-12 rounded-full border p-3 md:size-16 md:p-4" />
   <h1 className="text-center text-lg md:text-2xl">Answers Review</h1>
   <p className="mb-4 text-center text-muted-foreground">Good round! Here are the answers from the members.</p>
   <QuizChart quizMembers={memberAnswers} />
   <Button className="mx-auto mt-4" onClick={() => socket.emit("nextQuestion", { quizId, auth })}>
    Next Question
    <ArrowRightIcon className="ml-2 size-4" />
   </Button>
  </>
 );
}