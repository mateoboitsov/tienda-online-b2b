"use client";

import { Header } from "@/components/layout/Header";
import B2BLogin from "@/components/auth/B2BLogin";

export default function LoginPage() {
  return (
    <>
      <Header />
      <div className="pt-20 min-h-screen">
        <B2BLogin />
      </div>
    </>
  );
}