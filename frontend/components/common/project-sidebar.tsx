type ProjectSidebarProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectSidebar({ params }: ProjectSidebarProps) {
  const { projectId } = await params;

  return <div></div>;
}
