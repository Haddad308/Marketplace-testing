"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FREE_SEARCH_COUNT } from "@/lib/constants";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ open, onClose }: Props) {
  const router = useRouter();

  const handleSubscribe = () => {
    onClose();
    router.push("/subscribe");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-900 border border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Search Limit Reached</DialogTitle>
        </DialogHeader>
        <div className="text-sm mt-2">
          You’ve used all {FREE_SEARCH_COUNT} of your free searches. To continue
          using search features, please subscribe.
        </div>
        <DialogFooter className="mt-4">
          <Button
            onClick={handleSubscribe}
            className="w-full border border-white cursor-pointer bg-purple-600 hover:bg-purple-700"
          >
            Go to Subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
