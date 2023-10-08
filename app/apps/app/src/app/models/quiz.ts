import { FormControl } from '@angular/forms';

export interface QuizQuestion {
  question: string;
  options: QuizQuestionOption[];

  // Generated values
  _id?: string;
  _control?: FormControl;
}

export interface QuizQuestionOption {
  option: string;
  correct?: boolean;
}
