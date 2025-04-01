"use client";

import { CircleIcon, DiamondIcon, RotateCwIcon, SquareIcon, TriangleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { socket } from "@/lib/socket";
import { cn } from "@/lib/cn";

interface Question {
 question: string;
 options: { option: string }[];
}

export default function QuestionDisplay({ quizId, auth }: { quizId: string; auth: string }) {
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
  if (data.membersWhoSubmitted.some((member) => member === auth)) {
   setCompleted(true);
  } else {
   setCompleted(false);
  }
 };

 useEffect(() => {
  socket.on("updateQuestion", handleSync);

  socket.on("quizCompleted", () => {
   toast.success("Quiz completed successfully");
   setQuestion({ question: "", options: [] });
   setCompleted(true);
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

  return () => {
   socket.off("updateQuestion", handleSync);
   socket.off("quizCompleted");
   socket.off("redirectToAnswers");
   socket.off("error");
   socket.off("kicked");
  };
 }, [quizId, router]);

 const icons = [TriangleIcon, DiamondIcon, CircleIcon, SquareIcon];
 const colors = ["bg-button-triangle hover:bg-button-triangle/80", "bg-button-diamond hover:bg-button-diamond/80", "bg-button-circle hover:bg-button-circle/80", "bg-button-square hover:bg-button-square/80"];

 return (
  <>
   {completed ? (
    <span className="text-muted-foreground flex items-center justify-center gap-4">
     <RotateCwIcon className="size-4 shrink-0 animate-spin" /> Redirecting to results...
    </span>
   ) : question.question === "" || timeRemaining === 0 ? (
    <span className="text-muted-foreground flex items-center justify-center gap-4">
     <RotateCwIcon className="size-4 shrink-0 animate-spin" /> Waiting for the next question...
    </span>
   ) : (
    <>
     {timeRemaining > 0 && (
      <Badge className="absolute left-1/2 top-0 mt-4 -translate-x-1/2 transform md:text-lg" variant="secondary">
       {timeRemaining} seconds left
      </Badge>
     )}

     <h1 className="mt-4 text-center text-4xl">{question.question}</h1>

     <div className="mt-8 grid grid-cols-2 gap-4">
      {question.options.map((option, index) => {
       const SelectedIcon = icons[index % icons.length];
       return (
        <Button key={`${option.option}-${index}`} className={cn("cursor-default! h-auto w-full justify-start text-white", colors[index % colors.length])}>
         <SelectedIcon fill="currentColor" className="size-10 shrink-0" />
         <span className="ml-4 overflow-hidden text-ellipsis whitespace-nowrap text-2xl">{option.option}</span>
        </Button>
       );
      })}
     </div>
    </>
   )}
  </>
 );
}
