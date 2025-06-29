"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { userIdSchema, userNameSchema, UserName } from "@igorkowalczyk/quiz-utils/validators/quiz";
import { LogOutIcon, PlayIcon, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormField, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { socket } from "@/lib/socket";

export default function QuizJoin({ quizId }: { quizId: string }) {
 const [isJoined, setIsJoined] = useState<boolean>(false);
 const [started, setStarted] = useState<boolean>(false);
 const searchParams = useSearchParams();
 const router = useRouter();

 const form = useForm<UserName>({
  resolver: zodResolver(userNameSchema),
  defaultValues: {
   username: "",
  },
 });

 useEffect(() => {
  const userIdParsed = userIdSchema.safeParse(searchParams.get("userId"));
  if (!userIdParsed.success) return setIsJoined(false);

  const userId = userIdParsed.data;

  if (!userId) {
   setIsJoined(false);
   toast.error("Invalid userId received. Please try again.");
   return;
  }

  socket.emit("joinOrRejoinQuiz", { quizId, userId });

  socket.on("joined", () => {
   setIsJoined(true);
   return toast.success("You have successfully joined the quiz.");
  });

  socket.on("error", (error: { message: string }) => {
   toast.error(error.message);
   return setIsJoined(false);
  });

  socket.on("kicked", () => {
   toast.error("You have been kicked from the quiz.");
   router.replace("/");
  });

  socket.on("quizStarted", () => {
   router.replace(`/quiz/${quizId}/questions?userId=${userId}`);
   setStarted(true);
  });

  socket.on("error", (error: { message: string }) => {
   toast.error(error.message);
   setIsJoined(false);
  });

  socket.on("nextQuestion", () => {
   router.replace(`/quiz/${quizId}/questions?userId=${userId}`);
  });

  socket.on("quizCompleted", () => {
   toast.success("Quiz completed successfully");
   router.replace(`/quiz/${quizId}/results?userId=${userId}`);
  });

  socket.on("redirectToAnswers", () => {
   router.replace(`/quiz/${quizId}/questions/answers?userId=${userId}`);
  });

  return () => {
   socket.off("joined");
   socket.off("error");
   socket.off("kicked");
   socket.off("quizStarted");
   socket.off("error");
   socket.off("nextQuestion");
   socket.off("quizCompleted");
   socket.off("redirectToAnswers");
  };
 }, [quizId, searchParams, router]);

 const onSubmit = () => {
  const { username } = form.getValues();

  if (!username.trim()) return toast.error("Please enter a valid name to join the quiz.");

  socket.emit("joinOrRejoinQuiz", { quizId, username });

  socket.on("joined", ({ userId }) => {
   const parsedSchema = userIdSchema.safeParse(userId);
   if (!parsedSchema.success) return toast.error("Invalid userId received. Please try again.");

   setIsJoined(true);
   router.replace(`/quiz/${quizId}?userId=${userId}`);
  });
 };

 return (
  <>
   {started ? (
    <>
     <PlayIcon className="mx-0 size-12 rounded-full border p-3 md:size-16 md:p-4" />
     <h1 className="text-center text-lg md:text-2xl">Quiz has started</h1>
     <p className="text-muted-foreground mb-4 text-center">Please wait for the questions to appear.</p>
    </>
   ) : !isJoined ? (
    <>
     <PlayIcon className="mx-0 size-12 rounded-full border p-3 md:size-16 md:p-4" />
     <h1 className="text-center text-lg md:text-2xl">Join the quiz</h1>
     <p className="text-muted-foreground mb-4 text-center">The quiz will start once everyone has joined.</p>
     <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
       <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
         <FormItem>
          <FormLabel>Your username</FormLabel>
          <FormControl>
           <Input type="text" placeholder="Enter your name" {...field} required />
          </FormControl>
          <FormDescription>Others will see this name during the quiz.</FormDescription>
          <FormMessage />
         </FormItem>
        )}
       />
       <div className="flex flex-wrap justify-center gap-4">
        <Button type="button" variant="secondary" onClick={() => router.replace("/join")}>
         <LogOutIcon />
         Leave
        </Button>
        <Button type="submit" disabled={started || !form.formState.isValid}>
         <PlayIcon />
         Join Quiz
        </Button>
       </div>
      </form>
     </Form>
    </>
   ) : (
    <>
     <RotateCw className="mx-0 size-12 animate-spin rounded-full border p-3 md:size-16 md:p-4" />
     <h1 className="text-center text-lg md:text-2xl">Waiting for the quiz to start</h1>
     <p className="text-muted-foreground mb-4 text-center">Please wait while the quiz creator starts the quiz.</p>
    </>
   )}
  </>
 );
}
