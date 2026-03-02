'use client';

import { useState, useTransition } from 'react';
import { Plus, Check, Loader2, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AddToProject({ listingId, projects, price }: { listingId: string, projects: any[], price: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAddToProject = async () => {
    if (!selectedProject) return;

    startTransition(async () => {
      try {
        const res = await fetch('/api/booking/add-item', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listingId,
            projectId: selectedProject,
            pricePerDay: price
          }),
        });

        if (res.ok) {
          router.push(`/project/${selectedProject}`);
          router.refresh();
        } else {
          alert("Failed to add to project.");
        }
      } catch (e) {
        console.error(e);
      }
    });
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="p-4 bg-zinc-900 border border-white/10 rounded-xl text-center">
        <p className="text-zinc-500 text-sm mb-3">You need an active project to book this.</p>
        <button 
          onClick={() => router.push('/dashboard?tab=projects')}
          className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-lg transition-colors"
        >
          Create Project
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 text-lg uppercase tracking-wide"
        >
          <Plus className="w-5 h-5" /> Add to Production
        </button>
      ) : (
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Select Target Project</h3>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white text-xs font-medium">Cancel</button>
          </div>
          
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProject(p.id)}
                className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${
                  selectedProject === p.id 
                    ? 'bg-amber-500/10 border border-amber-500 text-white' 
                    : 'bg-black/20 border border-white/5 text-zinc-400 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedProject === p.id ? 'bg-amber-500 text-black' : 'bg-white/5'}`}>
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-bold ${selectedProject === p.id ? 'text-amber-500' : 'text-zinc-300'}`}>{p.title}</p>
                    <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">{p.status}</p>
                  </div>
                </div>
                {selectedProject === p.id && <Check className="w-4 h-4 text-amber-500" />}
              </button>
            ))}
          </div>

          <button
            disabled={!selectedProject || isPending}
            onClick={handleAddToProject}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Selection'}
          </button>
        </div>
      )}
    </div>
  );
}
