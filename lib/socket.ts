import { io } from "socket.io-client";
import { toast } from "sonner";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {});

socket.on("error", (error: { message: string }) => {
 toast.error(error.message || "An unknown error occurred!");
});

socket.on("connect_error", (error: { message: string }) => {
 console.error("Error connecting to socket:", error);
});

socket.on("disconnect", () => {
 if (socket.active) {
  toast.error("Disconnected from the server. Please check your internet connection.");
 } else {
  toast.error("Failed to connect to the server. Please check your internet connection.");
 }
});

export { socket };
