'use client';

import { Film, Calendar, Plus, ChevronRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import NewProjectModal from './NewProjectModal';

export default function ProjectsHub({ projects }: { projects: any[] }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Productions</h2>
          <p className="text-zinc-500 text-sm font-medium">Manage your project sets and resource bookings.</p>
        </div>
        <NewProjectModal />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {projects.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-white/10 rounded-[2rem] bg-white/[0.02]">
            <Film className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs">No active productions found</p>
            <button className="mt-6 text-blue-400 font-bold text-sm hover:underline">Create your first project folder</button>
          </div>
        ) : (
          projects.map((project) => (
            <Link href={`/project/${project.id}`} key={project.id} className="group">
              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6 w-full">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:scale-105 transition-transform">
                    <Film className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{project.title}</h3>
                    <div className="flex flex-wrap gap-4 mt-1">
                      <span className="flex items-center gap-1.5 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5" /> {project.status}
                      </span>
                      <span className="flex items-center gap-1.5 text-blue-400/70 text-xs font-bold uppercase tracking-widest">
                         {project.budget} BHD Budget
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                  <div className="flex -space-x-2 overflow-hidden">
                    {/* Placeholder for resource avatars */}
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0a0a0a] bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                        +
                      </div>
                    ))}
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-white transition-colors" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
