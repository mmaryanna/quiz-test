import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

type UpdateButtonProps = {
  quizId: string;
};

export default function UpdateButton({ quizId }: UpdateButtonProps) {
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/quizzes/${quizId}/edit`);
        }}
        className="w-1/2 flex items-center justify-center gap-2 text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 hover:border-blue-600 px-4 py-2 rounded-lg font-medium transition-all"
      >
        <Pencil size={16} />
        Update 
      </button>
    </>
  );
}
