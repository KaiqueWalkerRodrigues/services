import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
  type?: ToastType;
  message: string;
  duration?: number; // milliseconds
}

export const showToast = ({
  type = "success",
  message,
  duration = 1250,
}: ToastOptions) => {
  toast[type](message, {
    position: "top-center",
    autoClose: duration,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const ToastProvider = () => (
  <ToastContainer
    position="top-center"
    autoClose={1250}
    theme="dark"
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
  />
);
