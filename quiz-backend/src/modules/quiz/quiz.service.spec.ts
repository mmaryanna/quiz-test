import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { QuizService } from './quiz.service';
import { Quiz } from './entities/quiz.entity';
import { Question } from '../question/entities/question.entity';
import { Option } from '../option/entities/option.entity';

import { QuestionType } from 'src/common/enum/question-type.enum';

describe('QuizService (Unit Tests)', () => {
  let service: QuizService;

  // Mock-репозиторій для Quiz. Імітує методи TypeORM Repository без підключення до БД.
  const quizRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  // Mock-репозиторій для Question.
  const questionRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
  };

  // Mock-репозиторій для Option.
  const optionRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    // Очищення історії викликів mock-функцій перед кожним тестом, щоб тести були незалежні.
    jest.clearAllMocks();

    // Створення тестового NestJS-модуля.
    // QuizService використовується реальний, а репозиторії підміняються mock-об’єктами.
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        { provide: getRepositoryToken(Quiz), useValue: quizRepositoryMock },
        { provide: getRepositoryToken(Question), useValue: questionRepositoryMock },
        { provide: getRepositoryToken(Option), useValue: optionRepositoryMock },
      ],
    }).compile();

    // Отримуємо екземпляр сервісу з тестового модуля.
    service = module.get<QuizService>(QuizService);
  });

  it('create(): створює quiz і викликає quizRepository.save()', async () => {
    // Підготовка “збереженої” сутності, яку мають повертати mock-методи.
    const quizEntity = { id: 1, title: 'Quiz 1', description: 'Desc 1' } as Quiz;

    // Налаштування поведінки mock-репозиторію для сценарію створення і збереження квізу.
    quizRepositoryMock.create.mockReturnValue(quizEntity);
    quizRepositoryMock.save.mockResolvedValue(quizEntity);

    // create() сервісу також створює питання, тому підставляємо мінімальні моки для Question.
    questionRepositoryMock.create.mockReturnValue({} as Question);
    questionRepositoryMock.save.mockResolvedValue({} as Question);

    // Вхідні дані для сервісу (DTO). 
    const dto = {
      title: 'Quiz 1',
      description: 'Desc 1',
      questions: [
        {
          type: QuestionType.BOOLEAN,
          questionText: 'Q1?',
          correctAnswer: true,
        },
      ],
    };

    const result = await service.create(dto as any);

    // Перевіряємо, що репозиторій отримав правильні дані для створення квізу.
    expect(quizRepositoryMock.create).toHaveBeenCalledWith({
      title: 'Quiz 1',
      description: 'Desc 1',
    });

    // Перевіряємо, що збереження квізу викликано один раз і повернено очікуваний результат.
    expect(quizRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(result).toBe(quizEntity);
  });

  it('create(): для BOOLEAN питання записує correctAnswer, а correctText = null', async () => {
    const quizEntity = { id: 1, title: 'Quiz', description: 'Desc' } as Quiz;

    quizRepositoryMock.create.mockReturnValue(quizEntity);
    quizRepositoryMock.save.mockResolvedValue(quizEntity);

    questionRepositoryMock.create.mockReturnValue({ id: 10 } as Question);
    questionRepositoryMock.save.mockResolvedValue({ id: 10 } as Question);

    const dto = {
      title: 'Quiz',
      description: 'Desc',
      questions: [
        {
          type: QuestionType.BOOLEAN,
          questionText: 'Is sky blue?',
          correctAnswer: true,
        },
      ],
    };

    await service.create(dto as any);

    // Перевіряємо бізнес-правило:
    // для типу BOOLEAN зберігається correctAnswer, а correctText не використовується (null).
    expect(questionRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        questionText: 'Is sky blue?',
        type: QuestionType.BOOLEAN,
        quiz: quizEntity,
        correctAnswer: true,
        correctText: null,
      }),
    );
  });

  it('create(): для INPUT питання записує correctText, а correctAnswer = null', async () => {
    const quizEntity = { id: 2, title: 'Quiz', description: 'Desc' } as Quiz;

    quizRepositoryMock.create.mockReturnValue(quizEntity);
    quizRepositoryMock.save.mockResolvedValue(quizEntity);

    questionRepositoryMock.create.mockReturnValue({ id: 20 } as Question);
    questionRepositoryMock.save.mockResolvedValue({ id: 20 } as Question);

    const dto = {
      title: 'Quiz',
      description: 'Desc',
      questions: [
        {
          type: QuestionType.INPUT,
          questionText: 'Capital of Ukraine?',
          correctText: 'Kyiv',
        },
      ],
    };

    await service.create(dto as any);

    // Перевіряємо бізнес-правило:
    // для типу INPUT зберігається correctText, а correctAnswer не використовується (null).
    expect(questionRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        questionText: 'Capital of Ukraine?',
        type: QuestionType.INPUT,
        quiz: quizEntity,
        correctAnswer: null,
        correctText: 'Kyiv',
      }),
    );
  });

  it('create(): для CHECKBOX без options кидає помилку', async () => {
    const quizEntity = { id: 3, title: 'Quiz', description: 'Desc' } as Quiz;

    quizRepositoryMock.create.mockReturnValue(quizEntity);
    quizRepositoryMock.save.mockResolvedValue(quizEntity);

    questionRepositoryMock.create.mockReturnValue({ id: 30 } as Question);
    questionRepositoryMock.save.mockResolvedValue({ id: 30 } as Question);

    const dto = {
      title: 'Quiz',
      description: 'Desc',
      questions: [
        {
          type: QuestionType.CHECKBOX,
          questionText: 'Choose correct options',
          options: [], // Некоректний сценарій: відсутні варіанти відповіді.
        },
      ],
    };

    // Перевіряємо, що сервіс відхиляє некоректний CHECKBOX-сценарій і генерує помилку.
    await expect(service.create(dto as any)).rejects.toThrow(
      'Checkbox question must have options',
    );

    // Додатково перевіряємо, що при помилці збереження опцій не викликається.
    expect(optionRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('create(): для CHECKBOX з options створює та зберігає опції', async () => {
    const quizEntity = { id: 4, title: 'Quiz', description: 'Desc' } as Quiz;
    const questionEntity = { id: 40 } as Question;

    quizRepositoryMock.create.mockReturnValue(quizEntity);
    quizRepositoryMock.save.mockResolvedValue(quizEntity);

    questionRepositoryMock.create.mockReturnValue(questionEntity);
    questionRepositoryMock.save.mockResolvedValue(questionEntity);

    // Для зручності: create повертає об'єкт опції, який йому передали.
    optionRepositoryMock.create.mockImplementation((x: any) => x);
    optionRepositoryMock.save.mockResolvedValue([]);

    const dto = {
      title: 'Quiz',
      description: 'Desc',
      questions: [
        {
          type: QuestionType.CHECKBOX,
          questionText: 'Pick 2',
          options: [
            { text: 'A', isCorrect: true },
            { text: 'B', isCorrect: false },
          ],
        },
      ],
    };

    await service.create(dto as any);

    // Перевіряємо, що збереження опцій було виконано.
    expect(optionRepositoryMock.save).toHaveBeenCalledTimes(1);

    // Перевіряємо, що опції створювалися з правильними даними та прив’язкою до питання.
    expect(optionRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'A',
        isCorrect: true,
        question: questionEntity,
      }),
    );

    expect(optionRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'B',
        isCorrect: false,
        question: questionEntity,
      }),
    );
  });

  it('findAll(): повертає список з numberOfQuestions', async () => {
    // Підготовка даних, які нібито повернула БД разом із зв’язками (questions).
    quizRepositoryMock.find.mockResolvedValue([
      { id: 1, title: 'Quiz A', questions: [{}, {}, {}] },
      { id: 2, title: 'Quiz B', questions: [{}] },
    ]);

    const result = await service.findAll();

    // Перевіряємо, що пошук викликано з підключенням зв’язку questions.
    expect(quizRepositoryMock.find).toHaveBeenCalledWith({
      relations: ['questions'],
    });

    // Перевіряємо, що сервіс повернув правильну структуру і коректно порахував кількість питань.
    expect(result).toEqual([
      { id: 1, title: 'Quiz A', numberOfQuestions: 3 },
      { id: 2, title: 'Quiz B', numberOfQuestions: 1 },
    ]);
  });

  it('findOne(): якщо quiz не знайдено — кидає "Quiz not found"', async () => {
    // Імітуємо ситуацію, коли запис у БД відсутній.
    quizRepositoryMock.findOne.mockResolvedValue(null);

    // Перевіряємо генерацію помилки для сценарію "не знайдено".
    await expect(service.findOne(999)).rejects.toThrow('Quiz not found');

    // Перевіряємо, що findOne викликано з правильними параметрами пошуку та зв’язками.
    expect(quizRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: 999 },
      relations: ['questions', 'questions.options'],
    });
  });

  it('deleteQuiz(): якщо quiz існує — викликає remove()', async () => {
    const quizEntity = { id: 5 } as Quiz;

    // Імітуємо, що квіз знайдено, і дозволяємо його "видалити" через remove.
    quizRepositoryMock.findOne.mockResolvedValue(quizEntity);
    quizRepositoryMock.remove.mockResolvedValue(quizEntity);

    await service.deleteQuiz(5);

    // Перевіряємо, що спочатку виконано пошук, а потім видалення знайденої сутності.
    expect(quizRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: 5 } });
    expect(quizRepositoryMock.remove).toHaveBeenCalledWith(quizEntity);
  });
});