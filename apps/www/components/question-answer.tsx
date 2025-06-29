"use client";

import { CircleIcon, DiamondIcon, RotateCwIcon, SquareIcon, TriangleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { socket } from "@/lib/socket";

interface Question {
 question: string;
 options: { option: string }[];
}

export default function QuestionAnswer({ userId, quizId }: { userId: string; quizId: string }) {
 const [question, setQuestion] = useState<Question>({
  question: "",
  options: [],
 });
 const [completed, setCompleted] = useState(false);
 const [timeRemaining, setTimeRemaining] = useState(0);
 const router = useRouter();

 const handleSync = (data: { question: Question; timeRemaining: number; membersWhoSubmitted: string[] }) => {
  setQuestion({
   question: data.question.question,
   options: data.question.options,
  });
  setTimeRemaining(data.timeRemaining);
  if (data.membersWhoSubmitted.some((member) => member === userId)) {
   setCompleted(true);
  } else {
   setCompleted(false);
  }
 };

 useEffect(() => {
  socket.emit("joinOrRejoinQuiz", { userId, quizId });

  socket.on("updateQuestion", handleSync);

  socket.on("answerSubmitted", () => {
   setCompleted(true);
  });

  socket.on("quizCompleted", () => {
   toast.success("Quiz completed successfully");
   router.replace(`/quiz/${quizId}/results?userId=${userId}`);
  });

  socket.on("redirectToAnswers", () => {
   router.replace(`/quiz/${quizId}/questions/answers?userId=${userId}`);
  });

  socket.on("error", (error: { message: string }) => {
   toast.error(error.message);
  });

  socket.on("kicked", () => {
   toast.error("You have been kicked from the quiz");
   router.push("/");
  });

  return () => {
   socket.off("updateQuestion", handleSync);
   socket.off("quizCompleted");
   socket.off("answerSubmitted");
   socket.off("redirectToAnswers");
   socket.off("error");
   socket.off("kicked");
  };
 }, [userId, quizId, router]);

 const submitAnswer = (answer: number) => {
  socket.emit("submitAnswer", { userId, quizId, answer });
 };

 const icons = [TriangleIcon, DiamondIcon, CircleIcon, SquareIcon];
 const colors = [
  "bg-button-triangle! hover:bg-button-triangle/80!",
  "bg-button-diamond hover:bg-button-diamond/80",
  "bg-button-circle hover:bg-button-circle/80",
  "bg-button-square hover:bg-button-square/80",
 ];

 return (
  <>
   {timeRemaining > 0 && (
    <Badge className="absolute left-1/2 top-0 mt-4 -translate-x-1/2 transform md:text-lg" variant="secondary">
     {timeRemaining} seconds left
    </Badge>
   )}

   {completed ? (
    <span className="text-muted-foreground flex items-center justify-center gap-4">
     <RotateCwIcon className="size-4 shrink-0 animate-spin" /> Waiting for other players to submit their answers...
    </span>
   ) : question.question === "" || timeRemaining === 0 ? (
    <span className="text-muted-foreground flex items-center justify-center gap-4">
     <RotateCwIcon className="size-4 shrink-0 animate-spin" /> Waiting for the next question...
    </span>
   ) : (
    <>
     <div className="absolute inset-0 flex items-center justify-center p-12">
      <div className="grid w-full max-w-md grid-cols-2 gap-4 md:gap-6 lg:gap-8">
       {question.options.map((option, index) => {
        const SelectedIcon = icons[index % icons.length];
        return (
         <Button
          key={`${option.option}-${index}`}
          className={cn("aspect-square h-auto w-full justify-start rounded-xl text-white", colors[index % colors.length])}
          onClick={() => submitAnswer(index)}
         >
          <SelectedIcon fill="currentColor" className="h-full! w-full!" />
         </Button>
        );
       })}
      </div>
     </div>
    </>
   )}
  </>
 );
}
