import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import QuizMembers from "@/components/quiz-members";
import { Separator } from "@/components/ui/separator";
import { checkQuiz } from "@/lib/actions";
import { quizId } from "@/validators/quiz";

export default async function Page(props: { params: Promise<{ id: string }>; searchParams: Promise<{ auth?: string }> }) {
 const searchParams = await props.searchParams;
 const params = await props.params;
 const { id } = params;
 const { auth } = searchParams;

 if (!id) return notFound();
 if (!quizId.safeParse(id).success) return notFound();
 if (!auth) return redirect("/join");

 const quiz = await checkQuiz(id, auth);
 if (!quiz.exists) return notFound();

 if (!quiz.authenticated) return redirect("/join");

 if (quiz.started) return redirect("/");
 if (quiz.ended) return redirect(`/quiz/${id}/results`);
 if (quiz.isOnAnswer) return redirect(`/quiz/${id}/questions`);

 const quizUrl = new URL(`/quiz/${id}`, process.env.NEXT_PUBLIC_APP_URL).toString();

 const code = await QRCode.toDataURL(quizUrl, {
  width: 256,
  errorCorrectionLevel: "H",
  margin: 2,
  color: {
   dark: "#fff",
   light: "#0000",
  },
 });

 return (
  <>
   <h1 className="text-center text-lg md:text-2xl">To get started, scan the QR code below.</h1>

   <Image src={code} alt="QR code" width={256} height={256} className="mx-0 my-4 size-32 rounded-lg border md:size-48" />

   <p className="text-center text-lg md:text-2xl">
    Or enter the code:{" "}
    <Link href={`/quiz/${id}`} target="_blank">
     <code className="bg-muted relative rounded px-2 py-1 font-mono">
      {id.slice(0, 3)}-{id.slice(3)}
     </code>
    </Link>
   </p>

   <Separator orientation="horizontal" className="my-4" />

   <QuizMembers quizId={id} />
  </>
 );
}
