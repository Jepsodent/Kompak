"use client";

import { SidebarTrigger } from "../ui/sidebar";

export default function MainTopbar() {
  return (
    <div className="w-full h-[3rem] px-2 border justify-between items-center">
      <div className="h-full flex items-center gap-2">
        <SidebarTrigger className="cursor-pointer" />
      </div>

      <div className="h-full flex justify-end items-center gap-2"></div>
    </div>
  );
}
