import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { catchError, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { User } from 'src/modules/user/models/user.entity';
import { UserService } from 'src/modules/user/services/user.service';
import { Repository } from 'typeorm';
import { OtpAuthentication } from '../models/otp-authentication.entity';
import { dateAdd } from '@app/common';
import { PasswordResetRequest } from '../models/password-reset-request.entity';
import { EmailService } from '@app/common/shared/services/email.service';
import { QueueService } from '@app/common/shared/services/queue.service';
import { ResetPasswordDto } from '../models/reset-password';

const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  private userId: string;

  getUserId(): string {
    return this.userId || '';
  }

  setUserId(id: string) {
    this.userId = id;
  }

  constructor(
    @InjectRepository(OtpAuthentication)
    public readonly otpAuthenticationRepository: Repository<OtpAuthentication>,
    @Inject(UserService) public readonly userService: UserService,
    @Inject(EmailService) public readonly emailService: EmailService,
    private readonly queueService: QueueService,
    public readonly jwtService: JwtService,
    @InjectRepository(PasswordResetRequest)
    public readonly passwordResetRequestRepository: Repository<PasswordResetRequest>,
  ) {}

  public loginWithUsernameAndPassword(
    username: string,
    password: string,
  ): Observable<any> {
    return from(this.userService.findByUsername(username)).pipe(
      switchMap((user) => {
        if (!user) {
          return of(false);
        }
        return this.comparePasswords(password, user.password).pipe(
          switchMap((isValid) => {
            if (!isValid) {
              return of(false);
            }
            const jwtUser = {
              username: user.username,
              email: user.email,
              id: user.id,
              role: user.role,
              fullname: user.fullname,
            };
            return this.generateAccessToken(jwtUser).pipe(
              switchMap((token) => {
                jwtUser['token'] = token;
                return of(jwtUser);
              }),
            );
          }),
        );
      }),
    );
  }

  public hashPassword(password: string): Observable<string> {
    bcrypt.hash(password, 10, function (err, hash) {
      return of(hash);
    });

    return;
  }

  public hashOtp(otp: string): string {
    const salt = bcrypt.genSaltSync(5);
    const hash = bcrypt.hashSync(otp, salt);
    return hash;
  }

  public comparePasswords(
    newPassword: string,
    hashedPassword: string,
  ): Observable<any | boolean> {
    return of<any | boolean>(bcrypt.compareSync(newPassword, hashedPassword));
  }

  public generateAccessToken(data: any): Observable<string> {
    return from(
      this.jwtService.signAsync({
        data,
      }),
    );
  }

  public refreshToken(userId: string): Observable<any> {
    return from(this.userService.findOne(userId)).pipe(
      switchMap((user) => {
        if (!user) {
          return of(false);
        }
        const jwtUser = {
          username: user.username,
          email: user.email,
          id: user.id,
          role: user.role,
          fullname: user.fullname,
        };
        return this.generateAccessToken(jwtUser);
      }),
    );
  }

  public findOtp(
    mobile_number: string,
    otp: string,
  ): Observable<OtpAuthentication> {
    otp = this.hashOtp(otp);
    return from(
      this.otpAuthenticationRepository.query(
        `SELECT * FROM otp_authentications WHERE mobile_number = ? AND otp = ?`,
        [mobile_number, otp],
      ),
    );
    //return from(this.otpAuthenticationRepository.findOneBy({ mobile_number, otp }));
  }

  public findOtpByMobileNumber(
    mobile_number: string,
  ): Observable<OtpAuthentication> {
    return from(
      this.otpAuthenticationRepository.findOne({
        where: { mobile_number },
        order: { created_date: 'DESC' },
      }),
    );
  }

  //otp authentication
  public createOpt(otp: OtpAuthentication): Observable<OtpAuthentication> {
    let tempOtp = this.generateOtp(otp.otp_length);
    otp.otp = tempOtp;
    const createdOtp = this.otpAuthenticationRepository.create(otp);
    console.log(tempOtp);
    return from(this.otpAuthenticationRepository.save(createdOtp));
  }

  public verifyOtp(mobileNumber: string, otp: string): Observable<any> {
    return from(this.findOtpByMobileNumber(mobileNumber)).pipe(
      switchMap((otpResult) => {
        console.log(otpResult);
        const hasOtpExpired = this.checkOtpExpiry(otpResult);
        return of(hasOtpExpired);

        if (!otpResult) {
          return of(false);
        }
        if (otpResult.verify_attempts >= otpResult.max_verify_attempts) {
          return of(false);
        }
        otpResult.verify_attempts += 1;

        return this.comparePasswords(otp, otpResult.otp).pipe(
          switchMap((isValid) => {
            if (!isValid) {
              this.updateOtp(otpResult);
              return of(false);
            }
            otpResult.status = 'verified';
            this.updateOtp(otpResult);
            return of(true);
          }),
        );
      }),
    );
  }

  checkOtpExpiry(otp: OtpAuthentication): Observable<boolean> {
    from(
      this.otpAuthenticationRepository.query(
        'SELECT CURRENT_TIMESTAMP() AS now;',
      ),
    ).pipe(
      switchMap((result) => {
        let currentDate = new Date(result[0].now);
        let otpExpiry = otp.expiry;
        let otpExpiryDate = dateAdd(
          new Date(otp.created_date),
          'minute',
          otpExpiry,
        );
        return of(currentDate > otpExpiryDate);
      }),
    );

    // .then((result) => {
    //     let currentDate = new Date(result[0].now);
    //     console.log('currentDate: ' + currentDate);
    //     console.log('created_date: ' + otp.created_date);
    //     let otpExpiry = otp.expiry;
    //     let otpExpiryDate = dateAdd(
    //       new Date(otp.created_date),
    //       'minute',
    //       otpExpiry,
    //     );
    //     console.log('otpExpiryDate : ' + otpExpiryDate);
    //     return currentDate > otpExpiryDate;
    //   });

    return of(true);
  }

  public updateOtp = (otp: OtpAuthentication) =>
    from(this.otpAuthenticationRepository.update(otp.id, otp));

  public generateOtp(len: number): string {
    let zeros = '0'.repeat(len - 1); // String of n zeros
    //console.log(zeros);
    let min = Number(1 + zeros);
    let max = Number(9 + zeros);
    let genOtp = Math.floor(min + Math.random() * max).toString();
    //console.log(genOtp);
    return genOtp;
  }

  public createPasswordReset(
    data: PasswordResetRequest,
  ): Observable<PasswordResetRequest> {
    const otp = this.generateOtp(6);

    const expires_at = new Date();
    expires_at.setMinutes(expires_at.getMinutes() + 10);

    data.otp = otp;
    data.expires_at = expires_at;

    const createdEntity = this.passwordResetRequestRepository.create(data);

    return from(this.passwordResetRequestRepository.save(createdEntity)).pipe(
      switchMap((savedRequest) =>
        this.userService.findByEmail(savedRequest.email).pipe(
          tap((user) => {
            // add user's fullname for the email
            data['fullname'] = user.fullname;
            // send email (non-blocking)
            this.emailService.sendEmailForPasswordReset(data);
          }),
          map(() => {
            delete savedRequest.otp;
            return savedRequest;
          }), // return the saved request
        ),
      ),
    );
  }

  public resetPassword(data: ResetPasswordDto): Observable<string> {
    return from(
      this.passwordResetRequestRepository.findOne({
        where: {
          otp: data.otp,
          email: data.email,
        },
      }),
    ).pipe(
      switchMap((passwordResetRequest) => {
        if (!passwordResetRequest) {
          return of('invalid otp');
        }

        // Optional: check if OTP is expired
        if (passwordResetRequest.expires_at < new Date()) {
          return of('otp expired');
        }

        // Optional: check if OTP has already been used
        if (passwordResetRequest.used) {
          return of('otp already used');
        }

        return from(this.userService.findByEmail(data.email)).pipe(
          switchMap((user) => {
            if (!user) {
              return of('invalid email');
            }

            // update password
            return from(
              this.userService.updatePassword(user.id, data.new_password),
            ).pipe(
              // mark OTP as used
              switchMap(() =>
                from(
                  this.passwordResetRequestRepository.update(
                    passwordResetRequest.id,
                    { used: true },
                  ),
                ),
              ),
              map(() => 'password reset successfully'),
            );
          }),
        );
      }),
      catchError((err) => {
        console.error('Error resetting password', err);
        return of('internal server error');
      }),
    );
  }
}
