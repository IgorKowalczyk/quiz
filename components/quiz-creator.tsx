"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, ChevronRightIcon, HomeIcon, ImportIcon, PlusIcon, SparklesIcon, TrashIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormDescription, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createQuiz } from "@/lib/actions";
import { errorParser } from "@/lib/utils";
import { quiz, Quiz } from "@/validators/quiz";

export default function CreateQuizPage() {
 const [quizName, setQuizName] = React.useState<string | null>(null);
 const router = useRouter();

 const form = useForm<Quiz>({
  resolver: zodResolver(quiz),
  defaultValues: {
   name: "",
   questions: [
    {
     question: "",
     id: React.useId(),
     options: [
      {
       option: "",
       correct: false,
      },
      {
       option: "",
       correct: false,
      },
      {
       option: "",
       correct: false,
      },
      {
       option: "",
       correct: false,
      },
     ],
    },
   ],
  },
 });

 const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "questions",
 });

 const [isModalOpen, setIsModalOpen] = React.useState(false);
 const [questionToRemove, setQuestionToRemove] = React.useState<number | null>(null);
 const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
 const [importData, setImportData] = React.useState("");

 const onSubmit = async (data: Quiz) => {
  // Validate that each question has at least one correct option
  const hasInvalidQuestions = data.questions.some((question) => question.options.every((option) => !option.correct));

  if (hasInvalidQuestions) {
   return toast.error("Each question must have at least one correct answer.");
  }

  const result = quiz.safeParse(data);
  if (!result.success) {
   const error = errorParser(result.error.issues);
   return toast.error(error);
  }

  const loadingToast = toast.loading("Creating quiz...");
  const createdQuiz = await createQuiz(data);
  if (createdQuiz.error) return toast.error(createdQuiz.error, { id: loadingToast });
  if (!createdQuiz.quiz)
   return toast.error("An error occurred while creating the quiz.", {
    id: loadingToast,
   });

  toast.success("Quiz created!", { id: loadingToast });
  router.push(`/join/${createdQuiz.quiz.id}?auth=${createdQuiz.quiz.auth}`);
 };

 const handleImport = () => {
  try {
   const parsedData = JSON.parse(importData);
   const result = quiz.safeParse(parsedData);
   console.log(result);
   if (result.success) {
    const updatedData = {
     ...result.data,
     questions: result.data.questions.map((question) => ({
      ...question,
      id: Math.random().toString(36).substring(2, 8),
      options: question.options.map((option) => ({
       ...option,
       id: Math.random().toString(36).substring(2, 8),
      })),
     })),
    };
    form.reset(updatedData);
    setIsImportDialogOpen(false);
   } else if (result.error) {
    const error = errorParser(result.error.issues);
    toast.error(error);
   }
  } catch (_error) {
   toast.error("Invalid JSON data! Please check the data and try again.");
  }
 };

 const handleQuizNameSubmit = (event: React.FormEvent) => {
  event.preventDefault();
  const name = form.getValues("name");
  if (name) setQuizName(name);
 };

 return (
  <>
   {!quizName ? (
    <Form {...form}>
     <form onSubmit={handleQuizNameSubmit} className="space-y-8">
      <FormField
       control={form.control}
       name="name"
       render={({ field }) => (
        <FormItem>
         <FormLabel className="flex items-center gap-2">
          Name
          <SparklesIcon className="size-4 cursor-pointer text-yellow-400" onClick={() => setIsImportDialogOpen(true)} />
         </FormLabel>
         <FormControl>
          <Input placeholder="Name your quiz" {...field} type="text" required />
         </FormControl>
         <FormDescription>This will be displayed to the players.</FormDescription>
         <FormMessage />
        </FormItem>
       )}
      />
      <div className="flex flex-wrap justify-center gap-4">
       <Link href="/" className={buttonVariants({ variant: "outline" })}>
        <HomeIcon className="mr-2 size-4" />
        Go back
       </Link>
       <Button type="submit" disabled={!form.watch("name")}>
        Next
        <ChevronRightIcon className="size-4" />
       </Button>
      </div>
     </form>
    </Form>
   ) : (
    <Form {...form}>
     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* <h2 className="text-center text-xl font-semibold">Quiz: {quizName}</h2> */}
      {fields.map((field, index) => (
       <div key={field.id}>
        <FormField
         control={form.control}
         name={`questions.${index}.question`}
         render={() => (
          <FormItem>
           <FormLabel htmlFor={`questions.${index}.question`}>Question {index + 1}</FormLabel>
           <div className="flex items-center gap-2">
            <FormControl>
             <Input id={`questions.${index}.question`} {...form.register(`questions.${index}.question`)} placeholder="Enter question" required />
            </FormControl>
            <Button
             variant="destructive"
             onClick={() => {
              setQuestionToRemove(index);
              setIsModalOpen(true);
             }}
            >
             <TrashIcon className="size-4" />
            </Button>
           </div>
           <FormMessage />
          </FormItem>
         )}
        />
        <p className="text-muted-foreground my-2 text-sm">Add a question to your quiz, remember to select the correct answer.</p>
        <div className="mt-4 space-y-4 border-l-4 pl-4">
         {field.options.map((_, i) => (
          <div key={i} className="flex items-center gap-4">
           <FormField
            control={form.control}
            name={`questions.${index}.options.${i}.option`}
            render={({ field }) => (
             <FormItem className="flex-1">
              <FormControl>
               <Input placeholder={`Option ${i + 1}`} {...field} required />
              </FormControl>
              <FormMessage />
             </FormItem>
            )}
           />
           <FormField
            control={form.control}
            name={`questions.${index}.options.${i}.correct`}
            render={({ field }) => (
             <FormItem>
              <FormControl>
               <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormMessage />
             </FormItem>
            )}
           />
          </div>
         ))}
        </div>
       </div>
      ))}

      <div className="flex flex-col items-center justify-center gap-4">
       {fields.length >= 20 && <p className="text-red-400">You can only add up to 20 questions.</p>}

       <Button
        type="button"
        onClick={() =>
         append({
          question: "",
          id: Math.random().toString(36).substring(2, 8),
          options: [
           { option: "", correct: false },
           { option: "", correct: false },
           { option: "", correct: false },
           { option: "", correct: false },
          ],
         })
        }
        disabled={fields.length >= 20}
       >
        <PlusIcon className="mr-2 size-4" />
        Add Question
       </Button>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-4">
       <Link href="/" className={buttonVariants({ variant: "outline" })}>
        <HomeIcon className="mr-2 size-4" />
        Go back
       </Link>
       <Button type="submit" disabled={fields.length === 0 || fields.length >= 20}>
        Submit
        <ChevronRightIcon className="size-4" />
       </Button>
      </div>
     </form>
    </Form>
   )}
   <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
    <DialogContent>
     <DialogHeader>
      <DialogTitle className="text-lg font-semibold">Confirm Removal</DialogTitle>
      <DialogDescription className="text-muted-foreground mt-2 text-sm">Are you sure you want to remove this question? This action cannot be undone.</DialogDescription>
     </DialogHeader>
     <DialogFooter className="gap-4 space-x-0!">
      <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
       <XIcon className="mr-2 size-4" />
       Cancel
      </Button>

      <Button
       variant={"destructive"}
       onClick={() => {
        if (questionToRemove !== null) {
         remove(questionToRemove);
         setIsModalOpen(false);
        }
       }}
      >
       <TrashIcon className="mr-2 size-4" />
       Remove
      </Button>
     </DialogFooter>
    </DialogContent>
   </Dialog>
   <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
    <DialogContent>
     <DialogHeader>
      <DialogTitle className="text-lg font-semibold">Import Quiz</DialogTitle>
      <DialogDescription className="text-muted-foreground mt-2 text-sm">You can import quiz data here, just paste the JSON data below.</DialogDescription>
     </DialogHeader>
     <Alert variant="destructive">
      <AlertCircleIcon className="size-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Importing quiz data will overwrite the current quiz data.</AlertDescription>
     </Alert>
     <Textarea placeholder="Enter quiz data" value={importData} onChange={(e) => setImportData(e.target.value)} className="min-h-40" />
     <DialogFooter className="gap-4 space-x-0!">
      <Button variant="secondary" onClick={() => setIsImportDialogOpen(false)}>
       <XIcon className="mr-2 size-4" />
       Cancel
      </Button>

      <Button onClick={handleImport}>
       <ImportIcon className="mr-2 size-4" />
       Import
      </Button>
     </DialogFooter>
    </DialogContent>
   </Dialog>
  </>
 );
}
