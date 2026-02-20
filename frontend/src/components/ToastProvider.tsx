"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3000,
                style: {
                    background: "#1e293b",
                    color: "#f1f5f9",
                    borderRadius: "12px",
                    padding: "14px 20px",
                    fontSize: "14px",
                    fontWeight: "500",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                    border: "1px solid rgba(255,255,255,0.08)",
                },
                success: {
                    iconTheme: {
                        primary: "#22c55e",
                        secondary: "#f1f5f9",
                    },
                },
                error: {
                    iconTheme: {
                        primary: "#ef4444",
                        secondary: "#f1f5f9",
                    },
                },
            }}
        />
    );
}
