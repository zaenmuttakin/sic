"use client";
import React, { useState } from "react";
import { ListGroup, ListGroupItem } from "flowbite-react";
import { Button, Drawer, DrawerHeader, DrawerItems } from "flowbite-react";

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);
  return (
    <div className="flex h-screen items-start justify-center w-full">
      <div className="flex flex-col gap-4 w-full max-w-2xl px-6">
        <div className="py-4">Stock opname</div>
        <div className="py-4">
          <div className="flex justify-center">
            <ListGroup className="w-full border-none rounded-lg">
              <ListGroupItem onClick={() => setIsOpen(true)}>
                19003434
              </ListGroupItem>
              <ListGroupItem onClick={() => setIsOpen(true)}>
                19003434
              </ListGroupItem>
              <ListGroupItem onClick={() => setIsOpen(true)}>
                19003434
              </ListGroupItem>
              <ListGroupItem onClick={() => setIsOpen(true)}>
                19003434
              </ListGroupItem>
            </ListGroup>
          </div>
          <Drawer open={isOpen} onClose={handleClose}>
            <DrawerHeader title="Drawer" />
            <DrawerItems>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                Supercharge your hiring by taking advantage of our&nbsp;
                <a
                  href="#"
                  className="text-cyan-600 underline hover:no-underline dark:text-cyan-500"
                >
                  limited-time sale
                </a>
                &nbsp;for Flowbite Docs + Job Board. Unlimited access to over
                190K top-ranked candidates and the #1 design job board.
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <a
                  href="#"
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-cyan-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
                >
                  Learn more
                </a>
                <a
                  href="#"
                  className="inline-flex items-center rounded-lg bg-cyan-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-800"
                >
                  Get access&nbsp;
                  <svg
                    className="ms-2 h-3.5 w-3.5 rtl:rotate-180"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 5h12m0 0L9 1m4 4L9 9"
                    />
                  </svg>
                </a>
              </div>
            </DrawerItems>
          </Drawer>
        </div>
      </div>
    </div>
  );
}
