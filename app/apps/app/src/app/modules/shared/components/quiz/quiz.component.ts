import { Component, ElementRef, EventEmitter, Input, isDevMode, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { getFormFieldError, markFormAsTouched, scrollToFirstInvalidControl } from '@app/ui';
import { QuizQuestion } from '../../../../models/quiz';

let nextUniqueId = 0;

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnChanges {

  @Input()
  questions: QuizQuestion[];

  @Output()
  completed: EventEmitter<void> = new EventEmitter<void>();

  form: FormGroup;

  @ViewChild('quiz', { static: true, read: ElementRef })
  quiz: ElementRef;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.questions) {
      this._build();
    }
  }

  getError(fieldName: string): string {
    const error = getFormFieldError(this.form, fieldName);
    return this.form.touched && this.form.get(fieldName).pristine && error ? error : null;
  }

  verifyQuizAnswers() {
    markFormAsTouched(this.form);
    this.form.markAsPristine();
    if (this.form.valid) {
      this.completed.emit();
    } else {
      scrollToFirstInvalidControl(this.quiz);
    }
  }

  // ---

  private _build(): void {
    this.questions = this._buildQuizFormElements(this.questions);
    this.form = new FormGroup(this.questions.reduce((obj, item) => {
      obj[item._id] = item._control;
      return obj;
    }, {}));
  }

  private _buildQuizFormElements(questions: QuizQuestion[]): QuizQuestion[] {
    return questions.map(question => {
      const answer = question.options.find(option => option.correct === true);
      return {
        ...question,
        _id: `q${ nextUniqueId++ }`,
        _control: new FormControl(isDevMode() ? answer : null, (control: AbstractControl) => {
          return control.value === answer ? null : { ['quizIncorrect']: true };
        })
      };
    });
  }
}
