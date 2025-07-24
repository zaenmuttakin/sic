"use client";
import { Button, Label, TextInput } from "flowbite-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex h-screen items-center justify-center px-12">
      <form className="flex flex-col gap-4 max-w-xs w-full">
        <div>
          <div className="mb-1 block">
            <Label htmlFor="email1">NIK</Label>
          </div>
          <TextInput id="email1" type="number" required />
        </div>
        <div>
          <div className="mb-1 block">
            <Label htmlFor="password1">Password</Label>
          </div>
          <TextInput id="password1" type="password" required />
        </div>
        <Button
          type="submit"
          className="mt-6"
          onClick={() => router.push("/private")}
        >
          Login
        </Button>
      </form>
    </div>
  );
}
