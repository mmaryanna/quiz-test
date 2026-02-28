import { QuestionType } from "src/common/enum/question-type.enum";
import { CreateOptionDto } from "src/modules/option/dto/create-option.dto";

export class CreateQuestionDto {
    type: QuestionType;
    questionText: string;
    correctAnswer?: boolean | null;
    correctText?: string | null;
    options?: CreateOptionDto[];
}
