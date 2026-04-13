import { Trash2 } from "lucide-react";
import posthog from "posthog-js";

type DeleteButtonProps = {
  quizId: string;
  quizTitle: string;
  deletingId: string | null;
  handleDelete: (quizId: string, quizTitle: string) => void;
};

export default function DeleteButton({
  quizId,
  quizTitle,
  deletingId,
  handleDelete,
}: DeleteButtonProps) {
  const isDeleting = deletingId === quizId;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();

        posthog.capture("task_deleted", {
          quiz_id: quizId,
          quiz_title: quizTitle,
          reason: "user_deleted",
        });

        handleDelete(quizId, quizTitle);
      }}
      disabled={isDeleting}
      className="w-1/2 flex items-center justify-center gap-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Trash2 size={16} />
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}