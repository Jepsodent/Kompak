"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Share2 } from "lucide-react";
import { PROJECTS } from "@/constants/projects.constant";
import { ShareDialog } from "@/components/common/share-dialog";
import { ProjectSummaryTab } from "./_components/project-summary-tab";
import { ProjectBoardTab } from "./_components/project-board-tab";
import { ProjectListTab } from "./_components/project-list-tab";
import { EditableText } from "@/components/common/editable-text";
import { toast } from "sonner";

type Tab = "summary" | "board" | "list";

export default function ProjectPage() {
  const params = useParams<{ projectId: string }>();
  const project = PROJECTS.find((p) => p.id === params?.projectId);
  
  const [tab, setTab] = useState<Tab>("summary");
  const [shareOpen, setShareOpen] = useState(false);

  if (!project) {
    return (
      <div className="p-12 text-center h-[calc(100vh-64px)] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-display font-bold">Project not found</h1>
        <p className="text-sm text-muted-foreground mt-2">It may have been archived or renamed.</p>
      </div>
    );
  }

  // Mock update logic
  const updateProjectName = (name: string) => {
    toast.success(`Project renamed to ${name} (Mock)`);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1800px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 mb-8">
        <div className="min-w-0 space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70">
              Project
            </p>
            <EditableText
              value={project.name}
              onSave={updateProjectName}
              label="project name"
              textClassName="text-3xl md:text-4xl font-display font-bold tracking-tight"
              className="mt-1"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {project.members.slice(0, 5).map((m) => (
                <div
                  key={m.id}
                  className={`size-8 rounded-full ring-2 ring-background flex items-center justify-center text-[10px] font-semibold ${m.color}`}
                  title={m.name}
                >
                  {m.initials}
                </div>
              ))}
              {project.members.length > 5 && (
                <div className="size-8 rounded-full ring-2 ring-background bg-foreground/5 flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                  +{project.members.length - 5}
                </div>
              )}
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              {project.members.length} members
            </span>
          </div>
        </div>

        <button
          onClick={() => setShareOpen(true)}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 border border-border rounded-full text-xs font-semibold hover:bg-foreground/5 transition-colors bg-card"
        >
          <Share2 className="size-3.5" />
          Share
        </button>
      </header>

      {/* Tabs */}
      <div className="border-b border-border mb-8 overflow-x-auto hide-scrollbar">
        <nav className="flex gap-8 min-w-max" role="tablist">
          {(["summary", "board", "list"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors capitalize ${
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground/70 hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>

      <div className="min-h-[500px]">
        {tab === "summary" && <ProjectSummaryTab project={project} />}
        {tab === "board" && <ProjectBoardTab project={project} />}
        {tab === "list" && <ProjectListTab project={project} />}
      </div>

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} projectName={project.name} />
    </div>
  );
}
