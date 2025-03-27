"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { checkQuiz } from "@/lib/actions";

export function QuizCodeInput() {
 const [code, setCode] = useState("");
 const [quizExists, setQuizExists] = useState<boolean | null>(null);
 const router = useRouter();

 const handleChange = async (newCode: string) => {
  setCode(newCode);

  if (newCode.length === 6) {
   const loadingToast = toast.loading("Checking quiz code...");

   const response = await checkQuiz(newCode);
   if (response.ended)
    return toast.error("This quiz has already ended!", {
     id: loadingToast,
    });
   if (response.started || response.isOnAnswer)
    return toast.error("This quiz has already started!", {
     id: loadingToast,
    });
   if (!response.exists)
    return toast.error("Quiz not found! Please check the code and try again.", {
     id: loadingToast,
    });

   if (response.exists) router.push(`/quiz/${newCode}`);

   setQuizExists(response.exists);
  } else {
   setQuizExists(null);
  }
 };

 return (
  <div>
   <InputOTP maxLength={6} containerClassName="flex-wrap items-center justify-center gap-2" onChange={handleChange} value={code}>
    <InputOTPGroup>
     <InputOTPSlot index={0} />
     <InputOTPSlot index={1} />
     <InputOTPSlot index={2} />
    </InputOTPGroup>
    <InputOTPSeparator className="hidden sm:block" />
    <InputOTPGroup>
     <InputOTPSlot index={3} />
     <InputOTPSlot index={4} />
     <InputOTPSlot index={5} />
    </InputOTPGroup>
   </InputOTP>

   {quizExists === false && <p className="text-destructive mt-4 text-sm">Quiz not found! Please check the code and try again.</p>}
  </div>
 );
}
