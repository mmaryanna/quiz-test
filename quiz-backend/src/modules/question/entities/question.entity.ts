import { QuestionType } from "src/common/enum/question-type.enum";
import { Option } from "src/modules/option/entities/option.entity";
import { Quiz } from "src/modules/quiz/entities/quiz.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('questions')
export class Question {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Quiz, (quiz) => quiz.questions)
    quiz: Quiz;

    @Column({
        type: "enum",
        enum: QuestionType,
        name: "question_type"
    })
    type: QuestionType;

    @Column({
        type: "varchar",
        name: "question_text",
    })
    questionText: string;

    @Column({
        type: "bool",
        name: "correct_answer",
        nullable: true
    })
    correctAnswer: boolean | null;

    @Column({
        type: "varchar",
        name: "correct_text",
        nullable: true
    })
    correctText: string | null;

    @OneToMany(() => Option, (option) => option.question, {
        onDelete: "CASCADE"
    })
    options: Option[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
