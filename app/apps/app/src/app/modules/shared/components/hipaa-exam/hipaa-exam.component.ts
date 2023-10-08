import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { QuizQuestion } from '../../../../models/quiz';
import { QuizComponent } from '../quiz/quiz.component';

@Component({
  selector: 'app-hipaa-exam',
  templateUrl: './hipaa-exam.component.html',
  styleUrls: ['./hipaa-exam.component.scss']
})
export class HipaaExamComponent {

  @Output()
  completed: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild(QuizComponent, { static: true })
  quiz: QuizComponent;

  readonly questions: QuizQuestion[] = [
    {
      question: 'What is HIPAA?',
      options: [
        { option: 'The federal rules for Medicare payments' },
        { option: 'The federal standards for the protection of health information', correct: true },
        { option: 'The federal rules for Medicaid payments' },
        { option: 'The state rules for Medicaid' },
      ],
    },
    {
      question: 'What does the Privacy Rule do?',
      options: [
        { option: 'It limits the use and disclosure of protected information that is available to the patient' },
        { option: 'It prohibits the use and disclosure of protected information to law enforcement' },
        { option: 'It addresses the use and disclosure of an individual’s (patient) health information', correct: true },
        { option: 'It limits the use of living wills' },
      ],
    },
    {
      question: 'The HIPAA Security Rule defines "security" as the means for controlling:',
      options: [
        { option: 'Confidentiality, storage, and editing of electronic protected health information' },
        { option: 'Confidentiality, storage, and access to electronic protected health information', correct: true },
        { option: 'Sharing, gathering, and monitoring of electronic protected health information' },
        { option: 'Destroying, encrypting, and securing of electronic protected health information' },
      ],
    },
    {
      question: 'Which of the following is not Individually Identifiable Information?',
      options: [
        { option: 'The individual’s past, present, or future physical or mental health or condition' },
        { option: 'The provision of health care to the individual' },
        { option: 'The past, present, or future payment for the provision of health care to the individual' },
        { option: 'Employment records that the covered entity maintains in its capacity as an employer', correct: true },
      ],
    },
    {
      question: 'Electronic Data Exchange defines:',
      options: [
        { option: 'Information that must be coded' },
        { option: 'Encryption methods' },
        { option: 'The format in which electronic patient information must be transferred between providers and payers', correct: true },
        { option: 'Who has access to protected health information' },
      ],
    },
    {
      question: 'Why is it important to comply with HIPAA regulations?',
      options: [
        { option: 'To show our commitment to protecting privacy' },
        { option: 'As an employee, you are obligated to comply with Getlabs’ privacy, and security policies and procedures' },
        { option: 'Our patients/members are placing their trust in us to preserve the privacy of their most sensitive and personal information' },
        { option: 'All of the above', correct: true },
      ],
    },
    {
      question: 'If you choose not to follow Getlabs HIPAA Policies:',
      options: [
        { option: 'You could be at risk of personal penalties and sanctions' },
        { option: 'You could put Getlabs at risk of financial and reputational harm' },
        { option: 'You will be terminated after your 4th infraction' },
        { option: 'a and b', correct: true },
      ],
    },
    {
      question: 'Getlabs must protect our patients\' Personal Health Information when it is created, stored, or transmitted:',
      options: [
        { option: 'In verbal and written discussions' },
        { option: 'In computer applications' },
        { option: 'On all forms of computer displays' },
        { option: 'All of the above', correct: true },
      ],
    },
    {
      question: 'Why is HIPAA training important?',
      options: [
        { option: 'To ensure your understanding of the Privacy and Security Rules as they relate to the work you perform for Getlabs', correct: true },
        { option: 'So you can share protected patient information without violating the patient\'s trust' },
        { option: 'So patients whose protected health information is shared cannot take legal action against Getlabs' },
        { option: 'To protect you from liability if a patient claims you shared their protected health information' },
      ],
    },
    {
      question: 'Protected Health Information includes:',
      options: [
        { option: 'Your inventory supply list, mileage log and badge information' },
        { option: 'A patient\'s lab results and invoices, appointment dates/times, and documentation of your encounters and visits', correct: true },
        { option: 'The amount of time you spent at the patient\'s home' },
        { option: 'The number of attempts required to obtain an adequate blood sample' },
      ],
    },
    {
      question: 'HIPAA allows Use and/or Disclosure of Protected Health Information for the purpose of:',
      options: [
        { option: 'Treatment, payment, and normal business activities', correct: true },
        { option: 'Treatment, curiosity, and payment' },
        { option: 'Federal criminal investigations' },
        { option: 'Investigative reporting for the public well being' },
      ],
    },
    {
      question: 'Who enforces HIPAA?',
      options: [
        { option: 'The U.S. Dept. of Justice, the public and the Office for Civil Rights', correct: true },
        { option: 'The U.S. Dept. of Justice, the public and the Office for Civil Liberties' },
        { option: 'The U.S. Dept. of Justice, the press and the Office for Civil Rights' },
        { option: 'The U.S. Dept. of Health and Human Services, the public and the Office for Civil Rights' },
      ],
    },
    {
      question: 'An example of a Type I Privacy Violation would be:',
      options: [
        { option: 'Discussing the tests you drew from the neighbor of your best friend' },
        { option: 'Dropping blood samples off at the wrong laboratory', correct: true },
        { option: 'Accidentally mislabeling a blood sample' },
        { option: 'Showing up at the wrong address for a blood draw' },
      ],
    },
    {
      question: 'Disabling the security settings on the phone that contains your Getlabs app would be an example of a:',
      options: [
        { option: 'Type I Privacy Violation' },
        { option: 'Type II Privacy Violation', correct: true },
        { option: 'Type III Privacy Violation' },
        { option: 'A violation of the Freedom of Information Act' },
      ],
    },
    {
      question: 'What does HIPAA stand for?',
      options: [
        { option: 'Health Insurance Portability and Accountability Act', correct: true },
        { option: 'Health Information Privacy and Accountability Act' },
        { option: 'Health Insurance Protection and Accountability Act' },
        { option: 'Health Information Protection and Accountability Act' },
      ],
    },
  ];

}
