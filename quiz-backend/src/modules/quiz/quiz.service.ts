import { Injectable } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../question/entities/question.entity';
import { Option } from '../option/entities/option.entity';
import { QuestionType } from 'src/common/enum/question-type.enum';

@Injectable()
export class QuizService {

  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
  ) {

  }

  async create(createQuizDto: CreateQuizDto) {
    const quiz = this.quizRepository.create({
      title: createQuizDto.title,
      description: createQuizDto.description
    });

    await this.quizRepository.save(quiz);

    for (const questionDto of createQuizDto.questions) {
      const question = this.questionRepository.create({
        questionText: questionDto.questionText,
        type: questionDto.type,
        quiz,
        correctAnswer:
          questionDto.type === QuestionType.BOOLEAN
            ? questionDto.correctAnswer
            : null,
        correctText:
          questionDto.type === QuestionType.INPUT
            ? questionDto.correctText
            : null,
      });

      await this.questionRepository.save(question);

      if (questionDto.type === QuestionType.CHECKBOX) {
        if (!questionDto.options || questionDto.options.length <= 0) {
          throw new Error('Checkbox question must have options');
        }

        const options = questionDto.options.map((opt) =>
          this.optionRepository.create({
            text: opt.text,
            isCorrect: opt.isCorrect,
            question,
          }),
        );

        await this.optionRepository.save(options);
      }
    }

    return quiz;
  }

  async findAll() {
    const quizzes = await this.quizRepository.find({
      relations: ['questions'],
    });

    return quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      numberOfQuestions: quiz.questions.length,
    }));
  }

  async findOne(id: number) {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['questions', 'questions.options'],
    });

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    return quiz;
  }

  async update(id: number, updateQuizDto: UpdateQuizDto) {
  const quiz = await this.quizRepository.findOne({
    where: { id },
    relations: ['questions', 'questions.options'],
  });

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  quiz.title = updateQuizDto.title ?? quiz.title;
  quiz.description = updateQuizDto.description ?? quiz.description;

  await this.quizRepository.save(quiz);

  const existingQuestions = await this.questionRepository.find({
    where: { quiz: { id } },
    relations: ['options'],
  });

  for (const question of existingQuestions) {
    if (question.options?.length) {
      await this.optionRepository.remove(question.options);
    }
  }

  if (existingQuestions.length) {
    await this.questionRepository.remove(existingQuestions);
  }

  for (const questionDto of updateQuizDto.questions ?? []) {
    const question = this.questionRepository.create({
      questionText: questionDto.questionText,
      type: questionDto.type,
      quiz,
      correctAnswer:
        questionDto.type === QuestionType.BOOLEAN
          ? questionDto.correctAnswer
          : null,
      correctText:
        questionDto.type === QuestionType.INPUT
          ? questionDto.correctText
          : null,
    });

    await this.questionRepository.save(question);

    if (questionDto.type === QuestionType.CHECKBOX) {
      if (!questionDto.options || questionDto.options.length <= 0) {
        throw new Error('Checkbox question must have options');
      }

      const options = questionDto.options.map((opt) =>
        this.optionRepository.create({
          text: opt.text,
          isCorrect: opt.isCorrect,
          question,
        }),
      );

      await this.optionRepository.save(options);
    }
  }

  return await this.quizRepository.findOne({
    where: { id },
    relations: ['questions', 'questions.options'],
  });
}


 async deleteQuiz(id: number) {
  const quiz = await this.quizRepository.findOne({
    where: { id },
    relations: ['questions', 'questions.options'],
  });

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  for (const question of quiz.questions ?? []) {
    if (question.options?.length) {
      await this.optionRepository.remove(question.options);
    }
  }

  if (quiz.questions?.length) {
    await this.questionRepository.remove(quiz.questions);
  }

  await this.quizRepository.remove(quiz);
  
}
}