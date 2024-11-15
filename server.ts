import crypto from "node:crypto";
import http from "node:http";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { Server } from "socket.io";
import { z } from "zod";
import { getQuiz, getMembers, addMember, updateMembers, setIsOnAnswer, toggleStartQuiz, setCurrentQuestion } from "@/lib/actions";
import { Logger } from "@/lib/logger";
import getClient from "@/lib/redis";
import { authSchema, joinOrRejoinQuiz, kickMember, quizId as quizIdValidator, QuizMember } from "@/validators/quiz";

dotenv.config();

const app = express();
const client = getClient();

const userSocketMap = new Map<string, string>();
const questionTimers = new Map<string, NodeJS.Timeout>();
const questionEndTimes = new Map<string, number>();

if (process.env.NODE_ENV !== "production") {
 app.use(
  morgan("dev", {
   stream: {
    write: (message) => Logger("event", message),
   },
  })
 );
}

app.use(
 cors({
  origin: "*",
  methods: ["GET", "POST"],
  credentials: false,
 })
);

const server = http.createServer(app);

const io = new Server(server, {
 cors: {
  origin: "*",
  methods: ["GET", "POST"],
  credentials: false,
 },
});

const getQuestion = async (quizId: string | number, questionIndex: number) => {
 const quiz = await getQuiz(quizId.toString());
 if (!quiz) return null;

 const question = quiz.questions[questionIndex];
 return question;
};

const emitUpdateMemberList = (quizId: string | number, memberList: QuizMember[]) => {
 io.in(quizId.toString()).emit("updateMemberList", memberList);
 Logger("event", `Emitted 'updateMemberList' event for quiz ${quizId}`);
};

const emitQuestionUpdate = async (quizId: string | number, questionIndex: number, timeRemaining: number) => {
 const question = await getQuestion(quizId, questionIndex);
 if (!question) return;

 const options = question.options.map((option) => {
  delete (option as { correct?: boolean }).correct;
  return option;
 });

 question.options = options;

 const membersSubmitted = await getMembers(quizId);
 const membersWhoSubmitted = membersSubmitted.filter((member) => member.hasSubmitted).map((member) => member.userId) || [];

 io.in(quizId.toString()).emit("updateQuestion", {
  question,
  timeRemaining,
  membersWhoSubmitted,
 });
 Logger("event", `Emitted 'updateQuestion' event for quiz ${quizId} with ${timeRemaining}s remaining`);
};

const startQuestionTimer = async (quizId: string | number, duration: number) => {
 let timeRemaining = duration;

 const quiz = await getQuiz(quizId.toString());

 if (!quiz) {
  Logger("error", "Quiz not found");
  return;
 }

 await emitQuestionUpdate(quizId, quiz.currentQuestion, timeRemaining);

 const endTime = Date.now() + duration * 1000;
 questionEndTimes.set(quizId.toString(), endTime);

 const timer = setInterval(async () => {
  timeRemaining -= 1;
  if (timeRemaining <= 0) {
   clearInterval(timer);
   questionTimers.delete(quizId.toString());
   questionEndTimes.delete(quizId.toString());

   await setIsOnAnswer(quizId, true);

   io.in(quizId.toString()).emit("redirectToAnswers");
  }
  await emitQuestionUpdate(quizId, quiz.currentQuestion, timeRemaining);
 }, 1000);

 questionTimers.set(quizId.toString(), timer);
};

// Socket events

io.on("connection", (socket) => {
 // #region ping
 socket.on("ping", (startTime) => {
  try {
   const time = z.number().parse(startTime);
   socket.emit("pong", time);
  } catch (error) {
   Logger("error", "Invalid data received:", error);
   socket.emit("error", { message: "Invalid data received" });
  }
 });
 // #endregion

 // #region joinOrRejoinQuiz
 socket.on("joinOrRejoinQuiz", async (data) => {
  try {
   const { quizId, username, userId } = joinOrRejoinQuiz.parse(data);
   Logger("info", `joinOrRejoinQuiz data: ${quizId}, ${username}, ${userId}`);

   if (!quizId && username) {
    Logger("error", "Cannot join quiz without username");
    return socket.emit("error", {
     message: "Cannot join quiz without username",
    });
   }

   const newUserId = userId || crypto.randomUUID();
   userSocketMap.set(newUserId, socket.id);

   const members = await getMembers(quizId, true);
   const user = members.find((member) => member.userId === newUserId);

   if (user) {
    if (user.kicked) {
     Logger("info", `User ${newUserId} is kicked and cannot rejoin quiz ${quizId}`);
     return socket.emit("kicked");
    }

    Logger("event", `${user.username} rejoined quiz ${quizId}`);
    socket.emit("joined", { userId: newUserId, username: user.username });
   } else {
    const usernameExists = members.some((member) => member.username === username);

    if (usernameExists) {
     Logger("error", "Username already exists in quiz");
     return socket.emit("error", {
      message: "Username is already taken! Please choose another one",
     });
    }

    await addMember(quizId, {
     userId: newUserId,
     username: username || "",
     score: 0,
     kicked: false,
     hasSubmitted: false,
     newScore: 0,
     goodAnswer: false,
     color: `hsl(${Math.random() * 360}, 50%, 50%)`,
    });

    Logger("event", `${username} joined quiz ${quizId}`);
    socket.emit("joined", { userId: newUserId, username });
   }

   socket.join(quizId.toString());

   const memberList = await getMembers(quizId);
   emitUpdateMemberList(quizId, memberList);
  } catch (error) {
   Logger("error", "Invalid data received:", error);
   socket.emit("error", { message: "Invalid data received" });
  }
 });
 // #endregion

 // #region getMembers
 socket.on("getMembers", async (data) => {
  try {
   const { quizId } = z.object({ quizId: quizIdValidator }).parse(data);
   Logger("info", `getMembers data: ${quizId}`);

   const memberList = await getMembers(quizId);

   socket.join(quizId.toString());
   emitUpdateMemberList(quizId, memberList);
  } catch (error) {
   Logger("error", "Error fetching members:", error);
   socket.emit("error", { message: "Error fetching members" });
  }
 });
 // #endregion

 // #region kickMember
 socket.on("kickMember", async (data) => {
  try {
   const { quizId, userId, auth } = kickMember.parse(data);
   Logger("info", `kickMember data: ${quizId}, ${userId} with auth: ${auth}`);

   const quiz = await getQuiz(quizId.toString());

   if (!quiz) {
    Logger("error", "Quiz not found");
    return socket.emit("error", { message: "Quiz not found" });
   }

   if (quiz.auth !== auth) {
    Logger("error", "Unauthorized!");
    return socket.emit("error", {
     message: "You are not authorized to perform this action",
    });
   }

   const members = await getMembers(quizId, true);
   const userIndex = members.findIndex((member) => member.userId === userId);

   if (userIndex === -1) {
    Logger("error", "User not found in quiz");
    return socket.emit("error", { message: "User not found in quiz" });
   }

   members[userIndex].kicked = true;

   await updateMembers(quizId, members);
   emitUpdateMemberList(quizId, await getMembers(quizId));

   const userSocketId = userSocketMap.get(userId);

   if (userSocketId) {
    io.to(userSocketId).emit("kicked");
    Logger("event", `Kicked user ${userId} from quiz ${quizId}`);
   }
  } catch (error) {
   Logger("error", "Error kicking member:", error);
   socket.emit("error", { message: "Error kicking member" });
  }
 });
 // #endregion

 // #region quizStart
 socket.on("quizStart", async (data) => {
  Logger("info", "Received quizStart event");
  try {
   const { quizId } = z
    .object({
     quizId: quizIdValidator,
     auth: authSchema,
    })
    .parse(data);
   Logger("info", `quizStart data: ${quizId}`);

   toggleStartQuiz(quizId, true);

   const memberList = await getMembers(quizId);
   io.in(quizId.toString()).emit("quizStarted", memberList);
   Logger("event", `Emitted 'quizStarted' event for quiz ${quizId}`);

   setCurrentQuestion(quizId, 0);
   await setIsOnAnswer(quizId, false);

   startQuestionTimer(quizId, 30);
  } catch (error) {
   Logger("error", "Error starting quiz:", error);
   socket.emit("error", { message: "Error starting quiz" });
  }
 });
 // #endregion

 // #region submitAnswer
 socket.on("submitAnswer", async (data) => {
  try {
   Logger("info", "Received submitAnswer event");
   const { quizId, userId, answer } = z
    .object({
     quizId: quizIdValidator,
     userId: z.string().uuid(),
     answer: z.number(),
    })
    .parse(data);
   Logger("info", `submitAnswer data: ${quizId}, ${userId}, ${answer}`);

   const quiz = await getQuiz(quizId.toString());

   if (!quiz) {
    Logger("error", "Quiz not found");
    return socket.emit("error", { message: "Quiz not found" });
   }

   const question = await getQuestion(quizId, quiz.currentQuestion);

   if (!question) {
    Logger("error", "No question found");
    return socket.emit("error", { message: "No question found" });
   }

   if (quiz.isOnAnswer) {
    Logger("error", "Cannot submit answer after time is up");
    return socket.emit("error", {
     message: "Cannot submit answer after time is up",
    });
   }

   const members = await client.lRange(`quiz:${quizId}:members`, 0, -1);
   const memberList = members.map((member) => JSON.parse(member));
   const userIndex = memberList.findIndex((member) => member.userId === userId);

   if (userIndex === -1) {
    Logger("error", "User not found in quiz");
    return socket.emit("error", { message: "User not found in quiz" });
   }

   const user = memberList[userIndex];

   if (user.hasSubmitted) {
    Logger("error", "User has already submitted an answer for this question");
    return socket.emit("error", {
     message: "You have already submitted an answer for this question",
    });
   }

   const correctAnswer = question.options.findIndex((option) => option.correct);
   const isCorrect = correctAnswer === answer;

   Logger("info", `Answer submitted: ${isCorrect}. Correct answer: ${correctAnswer}, submitted answer: ${answer}`);

   const quizTimer = questionTimers.get(quizId.toString());
   if (!quizTimer) {
    Logger("error", "No timer found for quiz");
    return socket.emit("error", { message: "No timer found for quiz" });
   }

   const endTime = questionEndTimes.get(quizId.toString());

   if (!endTime) {
    Logger("error", "No end time found for quiz");
    return socket.emit("error", { message: "No end time found for quiz" });
   }

   const currentTime = Date.now();
   const timeRemaining = Math.max(0, Math.floor((endTime - currentTime) / 1000));

   Logger("info", `Time remaining for quiz ${quizId}: ${timeRemaining} seconds`);

   if (isCorrect) {
    user.score += timeRemaining * 5;
    user.newScore = timeRemaining * 5;
    user.goodAnswer = true;
   } else {
    user.newScore = 0;
    user.goodAnswer = false;
   }

   user.hasSubmitted = true;
   memberList[userIndex] = user;

   await updateMembers(quizId, memberList);

   const allSubmitted = memberList.every((member) => member.hasSubmitted);

   if (allSubmitted) {
    clearInterval(quizTimer);
    questionTimers.delete(quizId.toString());
    questionEndTimes.delete(quizId.toString());

    await setIsOnAnswer(quizId, true);

    io.in(quizId.toString()).emit("redirectToAnswers");
   }

   socket.emit("answerSubmitted");
  } catch (error) {
   Logger("error", "Error submitting answer:", error);
   socket.emit("error", { message: "Error submitting answer" });
  }
 });
 // #endregion

 // #region nextQuestion
 socket.on("nextQuestion", async (data) => {
  try {
   const { quizId, auth } = z.object({ quizId: quizIdValidator, auth: authSchema }).parse(data);
   Logger("info", `nextQuestion data: ${quizId}`);

   const quiz = await getQuiz(quizId.toString());

   if (!quiz) {
    Logger("error", "Quiz not found");
    return socket.emit("error", { message: "Quiz not found" });
   }

   if (quiz.auth !== auth) {
    Logger("error", "Unauthorized!");
    return socket.emit("error", {
     message: "You are not authorized to perform this action",
    });
   }

   if (!quiz.isOnAnswer) {
    Logger("error", "Cannot move to next question before current question ends");
    return socket.emit("error", {
     message: "Cannot move to next question before current question ends",
    });
   }

   if (quiz.ended) {
    Logger("error", "Quiz has already ended");
    return socket.emit("error", { message: "Quiz has already ended" });
   }

   if (questionTimers.has(quizId.toString())) {
    clearInterval(questionTimers.get(quizId.toString()));
    questionTimers.delete(quizId.toString());
   }

   const nextQuestionIndex = quiz.currentQuestion + 1;
   const question = await getQuestion(quizId, nextQuestionIndex);

   if (question) {
    setCurrentQuestion(quizId, nextQuestionIndex);
    await setIsOnAnswer(quizId, false);

    const members = await getMembers(quizId);

    members.forEach((member) => {
     member.hasSubmitted = false;
    });

    await updateMembers(quizId, members);

    io.in(quizId.toString()).emit("nextQuestion");

    startQuestionTimer(quizId, 30);
   } else {
    await client.json.set(`quiz:${quizId}:data`, "$.ended", true);
    io.in(quizId.toString()).emit("quizCompleted");
    Logger("event", `Emitted 'quizCompleted' event for quiz ${quizId}`);
   }
  } catch (error) {
   Logger("error", "Error fetching next question:", error);
   socket.emit("error", { message: "Error fetching next question" });
  }
 });
 // #endregion

 // #region quizCompleted
 socket.on("quizCompleted", (data) => {
  try {
   const { quizId } = z.object({ quizId: quizIdValidator }).parse(data);
   io.in(quizId.toString()).emit("quizCompleted");
   questionEndTimes.delete(quizId.toString());
   Logger("event", `Emitted 'quizCompleted' event for quiz ${quizId}`);
  } catch (error) {
   Logger("error", "Error completing quiz:", error);
   socket.emit("error", { message: "Error completing quiz" });
  }
 });
 // #endregion
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
 Logger("info", `Server listening on port ${port}`);
});
