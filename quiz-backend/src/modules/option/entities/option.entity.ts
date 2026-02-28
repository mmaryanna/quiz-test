import { Question } from "src/modules/question/entities/question.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('options')
export class Option {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "varchar"
    })
    text: string;

    @Column({
        type: "boolean"
    })
    isCorrect: boolean;

    @ManyToOne(() => Question, (question) => question.options, {
        onDelete: "CASCADE"
    })
    question: Question;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
