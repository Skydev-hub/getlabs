import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { QuizQuestion } from '../../../../models/quiz';
import { QuizComponent } from '../quiz/quiz.component';

@Component({
  selector: 'app-bbp-exam',
  templateUrl: './bbp-exam.component.html',
  styleUrls: ['./bbp-exam.component.scss']
})
export class BbpExamComponent {

  @Output()
  completed: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild(QuizComponent, { static: true })
  quiz: QuizComponent;

  readonly questions: QuizQuestion[] = [
    {
      question: 'Employees should use PPE when ____.',
      options: [
        { option: 'there is a reasonable anticipation of contact with blood or OPIM' },
        { option: 'cleaning up spills' },
        { option: 'responding to an emergency' },
        { option: 'all of the above', correct: true },
      ],
    },
    {
      question: 'Which of the following is an example of a work practice control?',
      options: [
        { option: 'Spill kits' },
        { option: 'Accessible handwashing stations' },
        { option: 'Proper decontamination of spill areas', correct: true },
        { option: 'Red hazardous waste bags' },
      ],
    },
    {
      question: 'Which of the following is a standard precaution for workers exposed to bloodborne pathogens?',
      options: [
        { option: 'Treat all liquids as hazardous for HIV' },
        { option: 'Treat all blood and bodily fluids of patients as potentially infectious materials', correct: true },
        { option: 'Test all blood and unknown bodily fluids for HIV after spills' },
        { option: 'Label unknown liquids with hazard signs' },
      ],
    },
    {
      question: 'Hepatitis B is an inflammation of which body organ?',
      options: [
        { option: 'Kidney' },
        { option: 'Lungs' },
        { option: 'Larynx' },
        { option: 'Liver', correct: true },
      ],
    },
    {
      question: 'In the event of an accidental needlestick, which following action should be taken first?',
      options: [
        { option: 'Notify appropriate personnel' },
        { option: 'Wash the area thoroughly', correct: true },
        { option: 'Seek medical treatment' },
        { option: 'Complete an incident or accident report' },
      ],
    },
    {
      question: 'Which of the following actions can help prevent exposure to bloodborne pathogens?',
      options: [
        { option: 'Wearing latex gloves' },
        { option: 'Wearing goggles' },
        { option: 'Washing hands' },
        { option: 'All of the above', correct: true },
      ],
    },
    {
      question: 'A vaccine is only available for which of the following major bloodborne pathogen viruses?',
      options: [
        { option: 'HIV' },
        { option: 'Hepatitis B', correct: true },
        { option: 'Hepatitis C' },
        { option: 'No vaccines are available for any of the three major BBP viruses' },
      ],
    },
    {
      question: 'Which of the following are potential routes of entry for bloodborne pathogens?',
      options: [
        { option: 'Mucous membranes of the eyes, nose, and mouth' },
        { option: 'Non-intact skin' },
        { option: 'Penetration by a contaminated sharp object' },
        { option: 'All of the above', correct: true },
      ],
    },
    {
      question: 'How long can the Hepatitis B virus can survive in dried blood?',
      options: [
        { option: 'Ten hours' },
        { option: 'Three days' },
        { option: 'One week', correct: true },
        { option: 'Two weeks' },
      ],
    },
    {
      question: 'How many people become infected with the Hepatitis B virus each year?',
      options: [
        { option: '10,000' },
        { option: '25,000' },
        { option: '250,000' },
        { option: '40,000', correct: true },
      ],
    },
    {
      question: 'What is the most common chronic bloodborne infection in the U.S.?',
      options: [
        { option: 'HIV' },
        { option: 'Hepatitis C', correct: true },
        { option: 'Hepatitis A' },
        { option: 'Hepatitis B' },
      ],
    },
    {
      question: 'To afford the victim the best protection from acquiring the virus, current research suggests that a facility’s post-exposure prophylaxis (PEP) for HIV be provided to qualified candidates ___',
      options: [
        { option: 'within hours of the exposure', correct: true },
        { option: 'anytime during the next business workday' },
        { option: 'only after a complete and thorough evaluation of the exposure has taken place' },
        { option: 'within one week of the exposure' },
      ],
    },
    {
      question: 'According to OSHA’s Bloodborne Pathogens Standard, the following body fluids pose a risk to healthcare workers:',
      options: [
        { option: 'Blood, semen, vaginal secretions, breast milk, synovial fluid, amniotic fluid' },
        { option: 'Blood, semen, vaginal secretions, cerebrospinal fluid, synovial fluid, pleural fluid', correct: true },
        { option: 'Blood, semen, urine, cerebrospinal fluid, synovial fluid, pleural fluid' },
        { option: 'Blood, semen, vaginal secretions, cerebrospinal fluid, sweat, pericardial fluid' },
      ],
    },
    {
      question: 'For mucous membrane exposures:',
      options: [
        { option: 'Irrigate the exposed tissue with tap water, sterile saline, or sterile water for 10 to 15 minutes', correct: true },
        { option: 'Irrigate the exposed tissue with tap water, sterile saline, or sterile water for 1 to 3 minutes' },
        { option: 'Irrigate the exposed tissue with a 10% bleach solution for 10 to 15 minutes' },
        { option: 'Scrub with friction and a 10% iodine compound for 5 minutes' },
      ],
    },
    {
      question: 'For cuts and needlesticks:',
      options: [
        { option: 'Briefly induce bleeding from the wound, if possible' },
        { option: 'Wash the site for 10 minutes using antimicrobial soaps, 10% iodine solution or chlorine-based agents' },
        { option: 'Remove any foreign material from the wound, if present' },
        { option: 'All of the above', correct: true },
      ],
    },
    {
      question: 'Which of the following would not be considered appropriate protective clothing for phlebotomists:',
      options: [
        { option: 'Lab coats that are left open in the front while worn' },
        { option: 'Protective gowns with long sleeves' },
        { option: 'Scrubs that the employee launders at home' },
        { option: 'a and c', correct: true },
      ],
    },
    {
      question: 'When providing immediate wound care for cuts and needlesticks, the following cleansing agent is not appropriate:',
      options: [
        { option: '10% iodine solution' },
        { option: 'Antimicrobial soaps' },
        { option: 'Undiluted bleach' },
        { option: 'a and c', correct: true },
      ],
    },
  ];

}
