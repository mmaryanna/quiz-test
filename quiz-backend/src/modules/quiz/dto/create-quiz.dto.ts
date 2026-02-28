import { CreateQuestionDto } from "src/modules/question/dto/create-question.dto";

export class CreateQuizDto {
    title: string;
    description: string;
    questions: CreateQuestionDto[];
}
