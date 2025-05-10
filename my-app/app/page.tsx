import KanbanBoard from '@/components/KanbanBoard';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <KanbanBoard />
    </main>
  );
}
