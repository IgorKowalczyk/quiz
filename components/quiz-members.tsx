"use client";

import { MinusIcon, RefreshCw } from "lucide-react";
import { PlayIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { socket } from "@/lib/socket";
import { QuizMember } from "@/validators/quiz";

export default function QuizMembers({ quizId }: { quizId: string }) {
 const [members, setMembers] = useState<QuizMember[]>([]);
 const [isStarted, setIsStarted] = useState(false);
 const router = useRouter();
 const searchParams = useSearchParams();
 const auth = searchParams.get("auth");

 useEffect(() => {
  socket.emit("getMembers", { quizId });

  socket.on("updateMemberList", (memberList: QuizMember[]) => {
   setMembers(memberList);
  });

  socket.on("quizStarted", () => {
   toast.success("Quiz started successfully");
   router.replace(`/quiz/${quizId}/questions/display?auth=${auth}`);
   setIsStarted(true);
  });

  socket.on("error", (error: { message: string }) => {
   toast.error(error.message);
  });

  socket.on("redirectToAnswers", () => {
   router.replace(`/quiz/${quizId}/questions/answers?auth=${auth}`);
  });

  socket.on("quizCompleted", () => {
   toast.success("Quiz completed successfully");
   router.replace(`/quiz/${quizId}/results?auth=${auth}`);
  });

  socket.on("nextQuestion", () => {
   router.replace(`/quiz/${quizId}/questions/display?auth=${auth}`);
  });

  return () => {
   socket.off("updateMemberList");
   socket.off("quizStarted");
   socket.off("error");
   socket.off("redirectToAnswers");
   socket.off("quizCompleted");
   socket.off("nextQuestion");
  };
 }, [quizId, router, auth]);

 const handleStart = () => {
  socket.emit("quizStart", { quizId, auth });
 };

 const handleKick = (userId: string) => {
  socket.emit("kickMember", { quizId, userId, auth });
 };

 return (
  <div className="flex flex-col space-y-4">
   {members.length === 0 ? (
    <span className="text-muted-foreground flex items-center gap-2">
     <RefreshCw className="size-4 shrink-0 animate-spin" /> Waiting for other players to join...
    </span>
   ) : (
    <>
     <h2 className="text-center text-base md:text-lg">Everyone joined? Start the quiz!</h2>
     <Button onClick={handleStart} disabled={isStarted} className="mx-auto">
      <PlayIcon className="mr-2 size-4" />
      Start Quiz
     </Button>
    </>
   )}
   {members.map((member) => (
    <div key={member.userId} className="flex items-center gap-2">
     <Avatar>
      <AvatarFallback
       style={{
        backgroundColor: member.color,
       }}
      >
       {member.username.slice(0, 2).toUpperCase()}
      </AvatarFallback>
     </Avatar>
     <span>{member.username || member.userId || "Anonymous"}</span>
     <TooltipProvider delayDuration={100}>
      <Tooltip>
       <TooltipTrigger asChild>
        <div className="hover:text-destructive ml-auto px-4 py-2 duration-200" onClick={() => handleKick(member.userId)}>
         <MinusIcon className="size-4" />
        </div>
       </TooltipTrigger>
       <TooltipContent>Kick {member.username}</TooltipContent>
      </Tooltip>
     </TooltipProvider>
    </div>
   ))}
  </div>
 );
}
