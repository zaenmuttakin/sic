"use client";
import React from "react";
import { Avatar } from "flowbite-react";
import { Card } from "flowbite-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <div className="flex h-screen items-start justify-center w-full">
      <div className="flex flex-col gap-4 w-full max-w-2xl px-6">
        {/* topbar */}
        <div
          id="topbar"
          className=" flex justify-between items-center w-full py-4"
        >
          <div className="">
            <p>Hi zaen</p>
          </div>
          <Avatar
            img="https://i.pinimg.com/1200x/4d/52/d1/4d52d11cdbbd556de5f9940bdc76004c.jpg"
            rounded
          />
        </div>
        {/* <div className="h-full border py-4">Banner</div> */}
        <div className="h-full py-4">
          <div className="grid grid-cols-2 gap-4">
            <Card
              className="max-w-sm rounded-xl"
              onClick={() => router.push("/private/so")}
            >
              <p className="text-md font-bold tracking-tight text-gray-900 dark:text-white">
                Stock Opname
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
