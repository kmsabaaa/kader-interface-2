'use client';

import { useActionState } from 'react';
import { Calendar, Check, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { respondToBooking } from './actions';

interface BookingRequestCardProps {
  req: {
    id: string;
    startDate?: Date | null;
    endDate?: Date | null;
    listing?: { title: string; pricePerDay: number } | null;
    service?: { title: string; pricePerDay: number } | null;
    project: { title: string };
  };
}

export default function BookingRequestCard({ req }: BookingRequestCardProps) {
  const startDateStr = req.startDate ? new Date(req.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD';
  const endDateStr = req.endDate ? new Date(req.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD';
  
  let rentalDays = 1;
  if (req.startDate && req.endDate) {
    const diff = new Date(req.endDate).getTime() - new Date(req.startDate).getTime();
    rentalDays = Math.ceil(diff / (1000 * 3600 * 24));
    if (rentalDays <= 0) rentalDays = 1;
  }
  
  const itemName = req.listing?.title || req.service?.title || "Resource";
  const itemPrice = req.listing?.pricePerDay || req.service?.pricePerDay || 0;
  const totalEarn = itemPrice * rentalDays;

  const handleDecline = async (formData: FormData) => {
    return await respondToBooking(req.id, "DECLINED");
  };

  const handleApprove = async (formData: FormData) => {
    return await respondToBooking(req.id, "APPROVED");
  };

  const [declineState, declineAction, isDeclinePending] = useActionState(
    handleDecline as any,
    { success: null, error: undefined }
  );

  const [approveState, approveAction, isApprovePending] = useActionState(
    handleApprove as any,
    { success: null, error: undefined }
  );

  const errorState = declineState.error || approveState.error;
  const successState = declineState.success || approveState.success;

  return (
    <div className="bg-black/50 border border-white/10 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      {errorState && (
        <div className="w-full bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-2 items-start mb-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{errorState}</p>
        </div>
      )}
      
      {successState && (
        <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex gap-2 items-start mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-emerald-300 text-sm">Request processed successfully</p>
        </div>
      )}
      
      <div>
        <p className="text-white font-bold text-lg">{itemName}</p>
        <p className="text-zinc-400 text-sm mb-2">Requested for project: <span className="text-white font-medium">{req.project.title}</span></p>
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 bg-white/5 border border-white/10 w-fit px-3 py-1.5 rounded-lg mb-2">
          <Calendar className="w-3.5 h-3.5 text-amber-500" />
          <span>{startDateStr} — {endDateStr} ({rentalDays} {rentalDays === 1 ? 'day' : 'days'})</span>
        </div>
        <p className="text-emerald-400 text-sm font-bold mt-1">Payout: {totalEarn.toFixed(2)} BHD</p>
      </div>
      
      <div className="flex items-center gap-3 w-full md:w-auto">
        <form action={declineAction} className="flex-1 md:flex-none">
          <button 
            type="submit" 
            disabled={isDeclinePending || isApprovePending}
            className="w-full bg-red-500/10 hover:bg-red-500/20 disabled:bg-zinc-600 text-red-500 disabled:text-zinc-400 border border-red-500/30 disabled:border-zinc-600 font-bold rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed"
          >
            {isDeclinePending ? (
              <>
                <div className="w-3 h-3 border-2 border-red-500 border-t-red-300 rounded-full animate-spin" />
              </>
            ) : (
              <>
                <X className="w-4 h-4" /> Decline
              </>
            )}
          </button>
        </form>
        <form action={approveAction} className="flex-1 md:flex-none">
          <button 
            type="submit"
            disabled={isDeclinePending || isApprovePending}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-600 text-black disabled:text-zinc-400 font-bold rounded-lg px-6 py-2 flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed"
          >
            {isApprovePending ? (
              <>
                <div className="w-3 h-3 border-2 border-black border-t-emerald-400 rounded-full animate-spin" />
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> Approve
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
