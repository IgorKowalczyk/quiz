"use server";

import crypto from "node:crypto";
import getClient from "./redis";
import { errorParser } from "./utils";
import { CreatedQuiz, quiz, Quiz, QuizMember } from "./validators/quiz";

export async function createQuiz(inputQuiz: Quiz) {
 try {
  const parsedQuiz = quiz.safeParse(inputQuiz);

  const client = getClient();

  if (parsedQuiz.success) {
   const quizId = Math.floor(100000 + Math.random() * 900000).toString();
   const quizAuth = crypto.randomUUID();
   await client.json.set(`quiz:${quizId}:data`, "$", {
    ...parsedQuiz.data,
    started: false,
    ended: false,
    auth: quizAuth,
    currentQuestion: 0,
    isOnAnswer: false,
   });
   await client.expire(`quiz:${quizId}:data`, 960);

   return {
    quiz: {
     id: quizId,
     auth: quizAuth,
    },
   };
  } else {
   return {
    error: errorParser(parsedQuiz.error.issues),
   };
  }
 } catch (error) {
  return {
   error: "An error occurred while creating the quiz. Please try again.",
  };
 }
}

export async function checkQuiz(code: string, auth?: string) {
 const client = getClient();

 const quiz = (await client.json.get(`quiz:${code}:data`)) as CreatedQuiz;
 if (!quiz) return { exists: false };

 if (quiz.auth !== auth) {
  return {
   exists: true,
   authenticated: false,
   started: quiz.started,
   ended: quiz.ended,
   isOnAnswer: quiz.isOnAnswer,
  };
 }

 return {
  exists: true,
  authenticated: true,
  started: quiz.started,
  ended: quiz.ended,
  isOnAnswer: quiz.isOnAnswer,
 };
}

export async function getQuiz(code: string) {
 const client = getClient();

 const quiz = (await client.json.get(`quiz:${code}:data`)) as CreatedQuiz | null;
 if (!quiz) return null;

 return quiz;
}

export async function getMembers(quizId: string | number, includeKicked = false) {
 const client = getClient();

 const membersKey = `quiz:${quizId}:members`;
 const members = await client.lRange(membersKey, 0, -1);
 const parsedMembers: QuizMember[] = members.map((member) => JSON.parse(member));

 if (!includeKicked) {
  return parsedMembers;
 } else {
  return parsedMembers.filter((member) => !member.kicked);
 }
}

export async function addMember(quizId: string | number, member: QuizMember) {
 const client = getClient();

 const quizExpiry = await client.ttl(`quiz:${quizId}:data`);
 await client.rPush(`quiz:${quizId}:members`, JSON.stringify(member));
 await client.expire(`quiz:${quizId}:members`, quizExpiry);
}

export async function updateMembers(quizId: string | number, members: QuizMember[]) {
 const client = getClient();

 await client.del(`quiz:${quizId}:members`);
 for (const member of members) {
  await client.rPush(`quiz:${quizId}:members`, JSON.stringify(member));
 }
}

export async function toggleStartQuiz(quizId: string | number, start: boolean) {
 const client = getClient();

 await client.json.set(`quiz:${quizId}:data`, "$.started", start);
}

export async function setIsOnAnswer(quizId: string | number, isOnAnswer: boolean) {
 const client = getClient();

 await client.json.set(`quiz:${quizId}:data`, "$.isOnAnswer", isOnAnswer);
}

export async function setCurrentQuestion(quizId: string | number, question: number) {
 const client = getClient();

 const quiz = await getQuiz(quizId.toString());
 if (!quiz) return false;
 if (quiz.currentQuestion + 1 >= quiz.questions.length) return false;

 await client.json.set(`quiz:${quizId}:data`, "$.currentQuestion", question);

 return true;
}
