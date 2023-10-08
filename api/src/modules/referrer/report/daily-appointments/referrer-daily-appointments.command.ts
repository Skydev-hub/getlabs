import { Injectable } from '@nestjs/common';
import { addHours, format, formatISO, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { AppointmentStatus } from '../../../../common/enums/appointment-status.enum';
import { LabCompany } from '../../../../common/enums/lab-company.enum';
import { AppointmentEntity } from '../../../../entities/appointment.entity';
import { User } from '../../../../entities/user.entity';
import { AppointmentService } from '../../../appointment/appointment.service';
import { Command, Positional } from '../../../command/command.decorator';
import { GCPConfig, PatientTimezoneConfig } from '../../../core/enums/config.enum';
import { ConfigService } from '../../../core/services/config.service';
import { LoggerService } from '../../../core/services/logger.service';
import { StorageService } from '../../../core/services/storage.service';
import { MarketService } from '../../../market/market.service';
import { NotificationService } from '../../../notification/services/notification.service';
import { ReportAggregatorService } from '../../../reporting/format/report-aggregator.service';
import { CsvFileService, CsvStream } from '../../../reporting/services/csv-file.service';
import { ReferrerDailyAppointmentsAggregateFormat } from './referrer-daily-appointments-aggregate.format';
import { ReferrerDailyReportNotification, ReferrerDailyReportNotificationParameters } from './referrer-daily-report.notification';

@Injectable()
export class ReferrerDailyAppointmentsCommand {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly csvFileService: CsvFileService,
    private readonly configService: ConfigService,
    private readonly appointmentService: AppointmentService,
    private readonly storageService: StorageService,
    private readonly notificationService: NotificationService,
    private readonly reportAggregatorService: ReportAggregatorService,
    private readonly marketService: MarketService,
  ) {}

  @Command({
    command: 'referrers:report:appointments:generate',
    describe: "Generate a report of the day's appointments, and where the samples were dropped off",
  })
  async run(
    @Positional({ name: 'lab' })
    lab: LabCompany = LabCompany.Labcorp,

    @Positional({ name: 'date' })
    date: string = format(utcToZonedTime(new Date(), 'America/Phoenix'), 'yyyy-MM-dd'),

    @Positional({
      name: 'recipients',
      coerce: (arg: string) =>
        arg.split(',').map((v) => {
          return { email: v.trim() };
        }),
    })
    recipients: Partial<User>[],

    /* Link TTL is defined in hours */
    @Positional({
      name: 'linkTtl',
      coerce: (v) => (typeof v === 'string' ? parseInt(v, 10) : v),
    })
    linkTtl: number = 24,
  ) {
    this.loggerService.log(`Starting report generation process... lab=${lab}, date=${date}`);

    /* Retrieve a report aggregator for the daily referrer report type. */
    const aggregator = this.reportAggregatorService.createReportAggregator(ReferrerDailyAppointmentsAggregateFormat, { lab });

    this.loggerService.log(`Querying the app database for appointments taking place on ${date}...`);
    /* Query the app DB for all appointments. */
    const appointments: AppointmentEntity[] = (await this.getAppointmentDescs(lab, date)).data;
    this.loggerService.log(`Found ${appointments?.length || 0} rows.`);

    /* If we did not find any rows, end the process now. */
    if (!appointments || !appointments.length) {
      this.loggerService.log(`No appointments scheduled to be delivered to ${lab} on ${date}. No report ` + `to be generated.`);

      return;
    }

    const bucket = this.configService.get(GCPConfig.LabcorpPrivateBucket);
    const filename = `reports/daily-appointments/rda-${lab}-${date}-${formatISO(new Date())}.csv`;
    let parser: CsvStream;

    /* Create a CSV parser for this report. */
    try {
      this.loggerService.log(`Generating CSV file parser`);

      parser = this.csvFileService.getCsvFormatter(ReferrerDailyAppointmentsAggregateFormat, this.storageService.write(bucket, filename), {
        lab,
      });
    } catch (err) {
      /* If we encounter an error, let's create an appropriate error message that coherently logs what happened... */
      this.loggerService.error(`Cannot generate CSV report - encountered an exception while creating the CSV parser: ` + err);
      throw err;
    }

    /* We will keep track of any recoverable errors generated by the below steps - we don't want to stop the report, but the error may
     * impact the report, depending on the impact, thus a notification should be appended to the end of the report generation process
     * indicating as such. */
    const errors = [];

    /* Iterate through each of the retrieved appointments, attempt to resolve market details, and perform the write operation
     * on the CSV file. */
    this.loggerService.log(`Starting market retrieval / output parallel step.`);
    await Promise.all(
      appointments.map((appointment) => {
        /* Use this array to track the entities resolved in the process of resolving the requisite report data.  This array will be used
         * to populate aggregator rows. */
        const entities: any[] = [appointment];

        /* Retrieve the market associated with this appointment. */
        const qb = this.marketService.getRepository().createQueryBuilder();

        this.loggerService.debug(`Retrieving market details for appointment ID: ${appointment.id}...`);

        return qb
          .innerJoin(`${qb.alias}.serviceAreas`, 's')
          .where(`s.id = :patientServiceArea`, { patientServiceArea: appointment.patient.address.serviceArea.id })
          .getOneOrFail()
          .then((market) => {
            /* Market details successfully retrieved - add them to our report population entity set. */
            this.loggerService.debug(`Resolved market details for appointment ID: ${appointment.id}`);
            entities.push(market);
          })
          .catch((err) => {
            /* Errors are generated from the above DB query - log the exception, but continue on with processing. */
            this.loggerService.error(`Cannot retrieve market details for appointment ID ${appointment.id}: ${err}`);
            errors.push(err);
          })
          .then(() => {
            /* Finally, we will use the aggregator to create an aggregate row object from the above-resolved entities, and will
             * use the aggregate row to populate the resulting report row. */
            this.loggerService.debug(`Processing row for appointment ID: ${appointment.id}`);

            /* Run the aggregator function against the current appointment. */
            try {
              const row = aggregator.populate(...entities);

              this.loggerService.debug(`Writing output row...`);
              parser.inputStream.push(row);
              this.loggerService.debug(`Output row written successfully.`);
            } catch (err) {
              /* In the event of an exception, log the error, but allow the report to continue processing rows. */
              this.loggerService.error(`Unable to output row due to an exception in the aggregation/writing step: ${err}`);
              errors.push(err);
            }
          });
      }),
    );

    /* Push null into the retrieved stream to indicate that we have finished recording report rows. */
    try {
      parser.inputStream.push(null);
      this.loggerService.log(`Retrieved rows pushed into the CSV file stream... waiting for the streaming process to terminate...`);
    } catch (err) {
      /* An error occuring on the above operation is considered fatal - log and throw the error. */
      this.loggerService.error(`Could not finalize report generation: ${err}`);
      throw err;
    }

    /* Wait for the parser/exporter to finish before logging completion status. */
    await parser.getComplete$();

    if (errors.length) {
      this.loggerService.warn(
        `Report completed with errors: ${errors.reduce((str, error) => {
          return str + `\n${error}`;
        }, '')}`,
      );
    }

    this.loggerService.log(`Report complete - CSV file available... bucket: ${bucket} filename: ${filename}`);

    /* If a recipient is defined, automatically generate a report and dispatch a signed link accordingly... */
    if (recipients && recipients.length) {
      this.loggerService.log(`Recipient indicated... sending a notification to ${recipients.map((recipient) => recipient.email)}`);

      const expiry = addHours(new Date(), linkTtl);
      const link = await this.storageService.getSignedUrl(bucket, filename, {
        action: 'read',
        expires: expiry.getTime(),
      });

      await this.notificationService.send<ReferrerDailyReportNotificationParameters>(ReferrerDailyReportNotification, recipients, {
        expiry,
        link,
        date: parseISO(date),
        tz: this.configService.get(PatientTimezoneConfig.DefaultTimezone),
      });

      this.loggerService.log(`Notification dispatched.`);
    }
  }

  private async getAppointmentDescs(lab: LabCompany, date: string) {
    /* Query the app db for appointments delivered to the supplied lab on the supplied day. */
    return this.appointmentService.query((qb) => {
      qb.leftJoinAndSelect(`${qb.alias}.labLocation`, 'l')
        .where('l.lab = :lab')
        // TODO: This is fine for now, but as we expand hours this will need to change to a proper range since appointments
        //  later in the day might actually be in the next day in UTC time.
        .andWhere('DATE(start_at) = :date')
        .andWhere('status IN (:...statuses)')
        .orderBy('start_at', 'ASC')
        .setParameters({
          lab,
          date,
          statuses: [AppointmentStatus.Collected, AppointmentStatus.Completed],
        });
    });
  }
}